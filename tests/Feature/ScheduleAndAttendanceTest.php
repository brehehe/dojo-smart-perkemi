<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\AttendanceStatus;
use App\Enums\DojoStatus;
use App\Enums\KenshiRank;
use App\Enums\ScheduleProgramType;
use App\Models\Attendance;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\TrainingSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ScheduleAndAttendanceTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Dojo $dojo;

    private Kenshi $kenshi;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('SuperAdmin', 'web');
        Role::findOrCreate('Sensei', 'web');
        Role::findOrCreate('Kenshi', 'web');

        $this->admin = User::factory()->create();
        $this->admin->assignRole('SuperAdmin');

        $this->dojo = Dojo::create([
            'code' => 'DOJO-TEST-ATT',
            'name' => 'Dojo Senayan Test',
            'pengprov' => 'DKI Jakarta',
            'pengkab' => 'Jakarta Pusat',
            'status' => DojoStatus::Active,
        ]);

        $this->kenshi = Kenshi::create([
            'id_card_number' => 'KNS-TEST-ATT-01',
            'dojo_id' => $this->dojo->id,
            'full_name' => 'Bambang Perkemi',
            'gender' => 'M',
            'rank' => KenshiRank::Dan1,
            'is_active' => true,
        ]);
    }

    public function test_can_view_schedules_calendar_page(): void
    {
        $response = $this->actingAs($this->admin)->get('/schedules');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Schedules/Calendar')
            ->has('schedules')
            ->has('today_schedules')
            ->has('current_month')
            ->has('program_types')
        );
    }

    public function test_can_create_single_training_schedule(): void
    {
        $response = $this->actingAs($this->admin)->post('/schedules', [
            'dojo_id' => $this->dojo->id,
            'title' => 'Latihan Rutin Malam',
            'program_type' => ScheduleProgramType::Regular->value,
            'mode' => 'single',
            'date' => '2026-10-25',
            'start_time' => '19:00',
            'end_time' => '21:00',
            'location_name' => 'Hall C GBK',
            'latitude' => -6.2185700,
            'longitude' => 106.8026100,
            'radius_meters' => 150,
            'instructor_name' => 'Sensei Budi',
        ]);

        $response->assertRedirect('/schedules');
        $this->assertDatabaseHas('training_schedules', [
            'dojo_id' => $this->dojo->id,
            'title' => 'Latihan Rutin Malam',
            'date' => '2026-10-25',
            'start_time' => '19:00',
            'end_time' => '21:00',
        ]);
    }

    public function test_can_create_multi_batch_training_schedules(): void
    {
        $dates = ['2026-10-26', '2026-10-28', '2026-10-30'];

        $response = $this->actingAs($this->admin)->post('/schedules', [
            'dojo_id' => $this->dojo->id,
            'title' => 'Pemusatan Latihan TC Kejurda',
            'program_type' => ScheduleProgramType::TournamentTc->value,
            'mode' => 'multi',
            'dates' => $dates,
            'start_time' => '16:00',
            'end_time' => '18:30',
            'location_name' => 'Hall C GBK',
        ]);

        $response->assertRedirect('/schedules');

        foreach ($dates as $date) {
            $this->assertDatabaseHas('training_schedules', [
                'dojo_id' => $this->dojo->id,
                'title' => 'Pemusatan Latihan TC Kejurda',
                'date' => $date,
            ]);
        }
    }

    public function test_can_view_attendance_checkin_page(): void
    {
        $schedule = TrainingSchedule::create([
            'dojo_id' => $this->dojo->id,
            'title' => 'Sesi Latihan Pagi',
            'program_type' => ScheduleProgramType::Regular,
            'date' => now()->toDateString(),
            'start_time' => '08:00',
            'end_time' => '10:00',
            'location_name' => 'Dojo Senayan',
        ]);

        $response = $this->actingAs($this->admin)->get("/attendance/check-in?schedule_id={$schedule->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Attendance/CheckIn')
            ->has('schedule')
            ->has('kenshis')
            ->has('attendance_statuses')
        );
    }

    public function test_can_record_attendance_with_geotag_and_photo(): void
    {
        $schedule = TrainingSchedule::create([
            'dojo_id' => $this->dojo->id,
            'title' => 'Sesi Embu & Randori',
            'program_type' => ScheduleProgramType::Regular,
            'date' => now()->toDateString(),
            'start_time' => '19:00',
            'end_time' => '21:00',
            'location_name' => 'Dojo Senayan',
            'latitude' => -6.2185700,
            'longitude' => 106.8026100,
            'radius_meters' => 150,
        ]);

        // Simulated base64 image (small 1x1 transparent png)
        $dummyPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

        $response = $this->actingAs($this->admin)->post('/attendance', [
            'training_schedule_id' => $schedule->id,
            'kenshi_id' => $this->kenshi->id,
            'status' => AttendanceStatus::Present->value,
            'latitude' => -6.2185800, // ~1.1 meters away from dojo
            'longitude' => 106.8026200,
            'location_accuracy' => 5.0,
            'photo' => $dummyPhoto,
            'notes' => 'Hadir tepat waktu di tatami',
        ]);

        $response->assertRedirect("/schedules/{$schedule->id}");

        $this->assertDatabaseHas('attendances', [
            'training_schedule_id' => $schedule->id,
            'kenshi_id' => $this->kenshi->id,
            'status' => AttendanceStatus::Present->value,
            'is_within_radius' => true,
        ]);

        $attendance = Attendance::where('training_schedule_id', $schedule->id)
            ->where('kenshi_id', $this->kenshi->id)
            ->first();

        $this->assertNotNull($attendance);
        $this->assertNotNull($attendance->photo_path);
        $this->assertLessThan(20, $attendance->distance_meters);
    }

    public function test_can_view_schedule_attendance_roster(): void
    {
        $schedule = TrainingSchedule::create([
            'dojo_id' => $this->dojo->id,
            'title' => 'Sesi Evaluasi UKT',
            'program_type' => ScheduleProgramType::UktPreparation,
            'date' => now()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '12:00',
        ]);

        Attendance::create([
            'training_schedule_id' => $schedule->id,
            'kenshi_id' => $this->kenshi->id,
            'status' => AttendanceStatus::Present,
            'check_in_at' => now(),
            'is_within_radius' => true,
        ]);

        $response = $this->actingAs($this->admin)->get("/schedules/{$schedule->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Schedules/Attendance')
            ->has('schedule')
            ->has('attendances')
            ->has('stats')
        );
    }

    public function test_kenshi_cannot_create_schedule(): void
    {
        $kenshiUser = User::factory()->create();
        $kenshiUser->assignRole('Kenshi');

        $response = $this->actingAs($kenshiUser)->post('/schedules', [
            'dojo_id' => $this->dojo->id,
            'title' => 'Latihan Ilegal Kenshi',
            'program_type' => ScheduleProgramType::Regular->value,
            'mode' => 'single',
            'date' => '2026-10-25',
            'start_time' => '19:00',
            'end_time' => '21:00',
        ]);

        $response->assertStatus(403);
    }

    public function test_sensei_can_create_schedule(): void
    {
        $senseiUser = User::factory()->create();
        $senseiUser->assignRole('Sensei');
        $this->dojo->update(['head_sensei_id' => $senseiUser->id]);

        $response = $this->actingAs($senseiUser)->post('/schedules', [
            'dojo_id' => $this->dojo->id,
            'title' => 'Latihan Dojo Sensei',
            'program_type' => ScheduleProgramType::Regular->value,
            'mode' => 'single',
            'date' => '2026-10-25',
            'start_time' => '19:00',
            'end_time' => '21:00',
        ]);

        $response->assertRedirect('/schedules');
        $this->assertDatabaseHas('training_schedules', [
            'dojo_id' => $this->dojo->id,
            'title' => 'Latihan Dojo Sensei',
        ]);
    }

    public function test_kenshi_cannot_delete_schedule(): void
    {
        $schedule = TrainingSchedule::create([
            'dojo_id' => $this->dojo->id,
            'title' => 'Sesi Latihan',
            'program_type' => ScheduleProgramType::Regular,
            'date' => '2026-10-26',
            'start_time' => '19:00',
            'end_time' => '21:00',
        ]);

        $kenshiUser = User::factory()->create();
        $kenshiUser->assignRole('Kenshi');

        $response = $this->actingAs($kenshiUser)->delete("/schedules/{$schedule->id}");
        $response->assertStatus(403);
    }

    public function test_admin_can_delete_schedule(): void
    {
        $schedule = TrainingSchedule::create([
            'dojo_id' => $this->dojo->id,
            'title' => 'Sesi Latihan Admin',
            'program_type' => ScheduleProgramType::Regular,
            'date' => '2026-10-26',
            'start_time' => '19:00',
            'end_time' => '21:00',
        ]);

        $response = $this->actingAs($this->admin)->delete("/schedules/{$schedule->id}");
        $response->assertRedirect('/schedules');
        $this->assertSoftDeleted('training_schedules', ['id' => $schedule->id]);
    }
}
