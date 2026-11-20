<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Actions\Examination\CheckUktEligibilityAction;
use App\Actions\Examination\PromoteKenshiUktAction;
use App\Actions\Examination\SubmitExaminationScoreAction;
use App\Enums\DojoStatus;
use App\Enums\ExaminationStatus;
use App\Enums\InvoiceStatus;
use App\Enums\InvoiceType;
use App\Enums\KenshiRank;
use App\Enums\RegistrationStatus;
use App\Models\Attendance;
use App\Models\CoachEvaluation;
use App\Models\Dojo;
use App\Models\Examination;
use App\Models\ExaminationRegistration;
use App\Models\Invoice;
use App\Models\Kenshi;
use App\Models\TrainingSchedule;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UktExaminationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $sensei;

    private User $kenshiUser;

    private Dojo $dojo;

    private Kenshi $kenshi;

    private Examination $exam;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::first();

        $this->sensei = User::factory()->create();
        $this->sensei->assignRole('Sensei');

        $this->dojo = Dojo::create([
            'code' => 'DOJO-UKT-01',
            'name' => 'Dojo Sawahan UKT Test',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Kota Surabaya',
            'head_sensei_id' => $this->sensei->id,
            'status' => DojoStatus::Active,
        ]);

        $this->kenshiUser = User::factory()->create();
        $this->kenshiUser->assignRole('Kenshi');

        $this->kenshi = Kenshi::create([
            'user_id' => $this->kenshiUser->id,
            'id_card_number' => 'KNS-UKT-001',
            'dojo_id' => $this->dojo->id,
            'full_name' => 'Kenshi Siap Ujian',
            'gender' => 'M',
            'rank' => KenshiRank::Kyu1,
            'is_active' => true,
        ]);

        $this->exam = Examination::create([
            'title' => 'UKT Semester II Surabaya',
            'level_scope' => 'pengkot_kyu',
            'location_name' => 'GOR Sawahan',
            'date' => now()->addDays(7)->toDateString(),
            'status' => ExaminationStatus::RegistrationOpen,
            'quota' => 50,
        ]);
    }

    public function test_gatekeeper_rejects_kenshi_with_unpaid_dues(): void
    {
        // Unpaid invoice
        Invoice::create([
            'kenshi_id' => $this->kenshi->id,
            'dojo_id' => $this->dojo->id,
            'type' => InvoiceType::KyuMonthly,
            'period' => '2026-10',
            'amount' => 50000,
            'status' => InvoiceStatus::Unpaid,
            'due_date' => now()->toDateString(),
        ]);

        $checker = app(CheckUktEligibilityAction::class);
        $result = $checker->execute($this->kenshi);

        $this->assertFalse($result['is_eligible']);
        $this->assertFalse($result['criteria']['dues_paid']['passed']);
    }

    public function test_gatekeeper_approves_kenshi_when_all_five_criteria_met(): void
    {
        // 1. Dues paid (no unpaid invoices)
        Invoice::create([
            'kenshi_id' => $this->kenshi->id,
            'dojo_id' => $this->dojo->id,
            'type' => InvoiceType::KyuMonthly,
            'period' => '2026-10',
            'amount' => 50000,
            'status' => InvoiceStatus::Paid,
            'due_date' => now()->toDateString(),
        ]);

        // 2. Attendance count >= 16 across 16 sessions
        for ($i = 0; $i < 16; $i++) {
            $schedule = TrainingSchedule::create([
                'dojo_id' => $this->dojo->id,
                'title' => "Latihan Sesi {$i}",
                'date' => now()->subDays(30 - $i)->toDateString(),
                'start_time' => '18:00',
                'end_time' => '20:00',
            ]);

            Attendance::create([
                'training_schedule_id' => $schedule->id,
                'kenshi_id' => $this->kenshi->id,
                'status' => 'present',
                'check_in_at' => now()->subDays(30 - $i),
            ]);
        }

        // 3. Coach evaluation >= 70
        CoachEvaluation::create([
            'kenshi_id' => $this->kenshi->id,
            'coach_id' => $this->sensei->id,
            'evaluation_date' => now()->toDateString(),
            'technique_score' => 85,
            'embu_score' => 80,
            'randori_score' => 80,
            'physical_score' => 80,
            'discipline_score' => 85,
            'overall_score' => 82,
            'grade' => 'B+ (Sangat Baik / Siap UKT)',
        ]);

        $checker = app(CheckUktEligibilityAction::class);
        $result = $checker->execute($this->kenshi);

        $this->assertTrue($result['is_eligible']);
        $this->assertTrue($result['criteria']['dues_paid']['passed']);
        $this->assertTrue($result['criteria']['attendance']['passed']);
        $this->assertTrue($result['criteria']['coach_evaluation']['passed']);
    }

    public function test_examiner_can_submit_digital_score(): void
    {
        $reg = ExaminationRegistration::create([
            'examination_id' => $this->exam->id,
            'kenshi_id' => $this->kenshi->id,
            'current_rank' => KenshiRank::Kyu1,
            'target_rank' => KenshiRank::Dan1,
            'is_eligible' => true,
            'status' => RegistrationStatus::Verified,
        ]);

        $scorer = app(SubmitExaminationScoreAction::class);
        // Scores: dokuhon (80 * 0.15 = 12), goho (80 * 0.25 = 20), juho (80 * 0.25 = 20), embu (85 * 0.20 = 17), randori (80 * 0.15 = 12) -> total 81.00
        $score = $scorer->execute($reg, $this->sensei, 80, 80, 80, 85, 80, 'Kerapian embu istimewa');

        $this->assertEquals(81.00, $score->total_weighted_score);
        $this->assertEquals(RegistrationStatus::Passed, $reg->fresh()->status);
        $this->assertEquals(81.00, $reg->fresh()->final_score);
    }

    public function test_can_finalize_promotion_and_upgrade_rank_to_dan1(): void
    {
        $this->assertEquals(KenshiRank::Kyu1, $this->kenshi->rank);

        $promoter = app(PromoteKenshiUktAction::class);
        $promotion = $promoter->execute($this->kenshi, $this->admin, $this->exam, 'SK-PB-DAN-2026-01');

        $this->assertEquals(KenshiRank::Dan1, $promotion->new_rank);
        $this->assertEquals(KenshiRank::Dan1, $this->kenshi->fresh()->rank);
        $this->assertDatabaseHas('kenshi_promotions', [
            'kenshi_id' => $this->kenshi->id,
            'new_rank' => KenshiRank::Dan1->value,
            'sk_number' => 'SK-PB-DAN-2026-01',
        ]);
    }
}
