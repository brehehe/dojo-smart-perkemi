<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\AttendanceStatus;
use App\Enums\DojoStatus;
use App\Enums\KenshiRank;
use App\Enums\ScheduleProgramType;
use App\Models\Attendance;
use App\Models\CoachEvaluation;
use App\Models\Dojo;
use App\Models\IndependentTraining;
use App\Models\Kenshi;
use App\Models\TrainingSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class KenshiModuleAndAttendanceFeatureTest extends TestCase
{
    use RefreshDatabase;

    private User $senseiUser;

    private User $kenshiUserA;

    private User $kenshiUserB;

    private Dojo $dojo;

    private Kenshi $kenshiA;

    private Kenshi $kenshiB;

    private TrainingSchedule $schedule;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('SuperAdmin', 'web');
        Role::findOrCreate('Sensei', 'web');
        Role::findOrCreate('Kenshi', 'web');

        $this->dojo = Dojo::create([
            'code' => 'DOJO-SURABAYA',
            'name' => 'Dojo Pengkot Surabaya',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Kota Surabaya',
            'status' => DojoStatus::Active,
        ]);

        $this->senseiUser = User::factory()->create();
        $this->senseiUser->assignRole('Sensei');

        $this->kenshiUserA = User::factory()->create();
        $this->kenshiUserA->assignRole('Kenshi');

        $this->kenshiA = Kenshi::create([
            'id_card_number' => 'KNS-SBY-001',
            'user_id' => $this->kenshiUserA->id,
            'dojo_id' => $this->dojo->id,
            'full_name' => 'Atlet Kenshi A',
            'gender' => 'M',
            'rank' => KenshiRank::Kyu1,
            'is_active' => true,
        ]);

        $this->kenshiUserB = User::factory()->create();
        $this->kenshiUserB->assignRole('Kenshi');

        $this->kenshiB = Kenshi::create([
            'id_card_number' => 'KNS-SBY-002',
            'user_id' => $this->kenshiUserB->id,
            'dojo_id' => $this->dojo->id,
            'full_name' => 'Atlet Kenshi B',
            'gender' => 'F',
            'rank' => KenshiRank::Kyu2,
            'is_active' => true,
        ]);

        $this->schedule = TrainingSchedule::create([
            'dojo_id' => $this->dojo->id,
            'title' => 'Latihan Tandoku Embu Surabaya',
            'date' => now()->format('Y-m-d'),
            'start_time' => '16:00',
            'end_time' => '18:00',
            'program_type' => ScheduleProgramType::Gashuku,
            'radius_meters' => 150,
            'is_active' => true,
        ]);
    }

    public function test_kenshi_only_sees_own_attendance_in_schedule_view(): void
    {
        // Record attendance for both Kenshi A and B
        Attendance::create([
            'training_schedule_id' => $this->schedule->id,
            'kenshi_id' => $this->kenshiA->id,
            'status' => AttendanceStatus::Present,
            'check_in_at' => now(),
        ]);

        Attendance::create([
            'training_schedule_id' => $this->schedule->id,
            'kenshi_id' => $this->kenshiB->id,
            'status' => AttendanceStatus::Present,
            'check_in_at' => now(),
        ]);

        // When Kenshi A views the schedule
        $response = $this->actingAs($this->kenshiUserA)
            ->get(route('schedules.show', $this->schedule->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Schedules/Attendance')
            ->where('is_kenshi_view', true)
            ->has('attendances', 1)
            ->where('attendances.0.kenshi_id', $this->kenshiA->id)
        );

        // When Sensei views the schedule, full roster is shown
        $senseiResponse = $this->actingAs($this->senseiUser)
            ->get(route('schedules.show', $this->schedule->id));

        $senseiResponse->assertOk();
        $senseiResponse->assertInertia(fn ($page) => $page
            ->component('Schedules/Attendance')
            ->where('is_kenshi_view', false)
            ->has('attendances', 2)
        );
    }

    public function test_kenshi_can_submit_permit_excuse_with_optional_photo(): void
    {
        Storage::fake('public');
        $fakePhoto = UploadedFile::fake()->image('surat_dokter.jpg');

        $response = $this->actingAs($this->kenshiUserA)
            ->post(route('attendance.permit'), [
                'training_schedule_id' => $this->schedule->id,
                'status' => 'sick',
                'notes' => 'Demam tinggi dan istirahat dokter.',
                'photo' => $fakePhoto,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('attendances', [
            'training_schedule_id' => $this->schedule->id,
            'kenshi_id' => $this->kenshiA->id,
            'status' => AttendanceStatus::Sick->value,
            'notes' => 'Demam tinggi dan istirahat dokter.',
            'verified_by' => null,
        ]);
    }

    public function test_sensei_can_approve_kenshi_permit_request(): void
    {
        $attendance = Attendance::create([
            'training_schedule_id' => $this->schedule->id,
            'kenshi_id' => $this->kenshiA->id,
            'status' => AttendanceStatus::Excused,
            'notes' => 'Ada ujian dinas.',
            'verified_by' => null,
        ]);

        $response = $this->actingAs($this->senseiUser)
            ->post(route('attendance.approve', $attendance->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $attendance->refresh();
        $this->assertEquals($this->senseiUser->id, $attendance->verified_by);
        $this->assertStringContainsString('Disetujui oleh', $attendance->notes);
    }

    public function test_sensei_or_admin_can_submit_permit_directly_for_kenshi(): void
    {
        $response = $this->actingAs($this->senseiUser)
            ->post(route('attendance.permit'), [
                'training_schedule_id' => $this->schedule->id,
                'kenshi_id' => $this->kenshiB->id,
                'status' => 'excused',
                'notes' => 'Telah melapor izin secara langsung ke Sensei.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('attendances', [
            'training_schedule_id' => $this->schedule->id,
            'kenshi_id' => $this->kenshiB->id,
            'status' => AttendanceStatus::Excused->value,
            'verified_by' => $this->senseiUser->id,
        ]);
    }

    public function test_sensei_can_override_attendance_status(): void
    {
        // Initially unmarked or absent
        Attendance::create([
            'training_schedule_id' => $this->schedule->id,
            'kenshi_id' => $this->kenshiA->id,
            'status' => AttendanceStatus::Absent,
            'notes' => 'Tanpa keterangan',
        ]);

        $response = $this->actingAs($this->senseiUser)
            ->post(route('attendance.override'), [
                'training_schedule_id' => $this->schedule->id,
                'kenshi_id' => $this->kenshiA->id,
                'status' => 'excused',
                'notes' => 'Diberikan izin lisan oleh Sensei Bambang',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('attendances', [
            'training_schedule_id' => $this->schedule->id,
            'kenshi_id' => $this->kenshiA->id,
            'status' => AttendanceStatus::Excused->value,
            'notes' => 'Diberikan izin lisan oleh Sensei Bambang',
        ]);
    }

    public function test_kenshi_can_log_and_delete_independent_training(): void
    {
        $response = $this->actingAs($this->kenshiUserA)
            ->post(route('modules.independent.store'), [
                'training_date' => now()->format('Y-m-d'),
                'drill_type' => 'Tandoku Embu',
                'title' => 'Latihan Mandiri Bentuk 1-4',
                'duration_minutes' => 45,
                'intensity' => 'medium',
                'reps_or_cycles' => '5 Set',
                'estimated_calories' => 250,
                'notes' => 'Pemanasan 10 menit dilanjutkan Tandoku Embu.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $training = IndependentTraining::where('kenshi_id', $this->kenshiA->id)->first();
        $this->assertNotNull($training);
        $this->assertSame('Latihan Mandiri Bentuk 1-4', $training->title);

        // Delete training entry
        $deleteResponse = $this->actingAs($this->kenshiUserA)
            ->delete(route('modules.independent.destroy', $training->id));

        $deleteResponse->assertRedirect();
        $this->assertSoftDeleted('independent_trainings', ['id' => $training->id]);
    }

    public function test_sensei_can_grade_kenshi_and_kenshi_can_view_evaluation(): void
    {
        $response = $this->actingAs($this->senseiUser)
            ->post(route('modules.evaluations.store'), [
                'kenshi_id' => $this->kenshiA->id,
                'evaluation_date' => now()->format('Y-m-d'),
                'technique_score' => 88,
                'embu_score' => 85,
                'randori_score' => 80,
                'physical_score' => 90,
                'discipline_score' => 95,
                'recommendation' => 'Siap Mengikuti Ujian Kenaikan Tingkat (UKT)',
                'notes' => 'Teknik goho sangat tajam dan kuda-kuda mantap.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $evaluation = CoachEvaluation::where('kenshi_id', $this->kenshiA->id)->first();
        $this->assertNotNull($evaluation);
        $this->assertSame(88, $evaluation->overall_score);
        $this->assertSame('B+ (Sangat Baik / Siap UKT)', $evaluation->grade);

        // Kenshi views their evaluations page
        $kenshiView = $this->actingAs($this->kenshiUserA)
            ->get(route('modules.evaluations'));

        $kenshiView->assertOk();
        $kenshiView->assertInertia(fn ($page) => $page
            ->component('Modules/CoachEvaluation')
            ->where('isKenshiOnly', true)
            ->has('evaluations', 1)
            ->where('evaluations.0.overall_score', 88)
        );
    }

    public function test_kenshi_dashboard_shows_personal_metrics(): void
    {
        $response = $this->actingAs($this->kenshiUserA)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('is_kenshi_only', true)
            ->has('kenshi_profile')
            ->has('kenshi_stats')
        );
    }
}
