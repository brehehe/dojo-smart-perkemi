<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Actions\Dues\ApproveDojoFeeSettingAction;
use App\Actions\Dues\CalculateAllocationAction;
use App\Actions\Dues\CheckDelinquencyAction;
use App\Actions\Dues\RecordPaymentAction;
use App\Actions\Dues\RequestDojoFeeSettingAction;
use App\Enums\BeneficiaryType;
use App\Enums\DojoStatus;
use App\Enums\FeeSettingStatus;
use App\Enums\InvoiceStatus;
use App\Enums\InvoiceType;
use App\Enums\KenshiRank;
use App\Models\Dojo;
use App\Models\DojoFeeSetting;
use App\Models\Invoice;
use App\Models\Kenshi;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerkemiDuesSystemTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $sensei;

    private Dojo $dojo;

    private Kenshi $kenshiKyu;

    private Kenshi $kenshiDan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::first();

        $this->sensei = User::factory()->create();
        $this->sensei->assignRole('Sensei');

        $this->dojo = Dojo::create([
            'code' => 'DOJO-SBY-TEST',
            'name' => 'Dojo Sawahan Surabaya',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Kota Surabaya',
            'head_sensei_id' => $this->sensei->id,
            'status' => DojoStatus::Active,
        ]);

        $this->kenshiKyu = Kenshi::create([
            'id_card_number' => 'KNS-KYU-001',
            'dojo_id' => $this->dojo->id,
            'full_name' => 'Kenshi Kyu Murid',
            'gender' => 'M',
            'rank' => KenshiRank::Kyu1,
            'is_active' => true,
        ]);

        $this->kenshiDan = Kenshi::create([
            'id_card_number' => 'KNS-DAN-001',
            'dojo_id' => $this->dojo->id,
            'full_name' => 'Kenshi Dan Hitam',
            'gender' => 'M',
            'rank' => KenshiRank::Dan1,
            'is_active' => true,
        ]);
    }

    public function test_ac01_kyukenshi_dues_allocated_to_five_beneficiaries(): void
    {
        $invoice = Invoice::create([
            'kenshi_id' => $this->kenshiKyu->id,
            'dojo_id' => $this->dojo->id,
            'type' => InvoiceType::KyuMonthly,
            'period' => '2026-10',
            'amount' => 50000,
            'status' => InvoiceStatus::Unpaid,
            'due_date' => now()->toDateString(),
        ]);

        $action = app(RecordPaymentAction::class);
        $payment = $action->execute($invoice, 50000, 'bri_transfer');

        $this->assertEquals(50000, $payment->amount);
        $this->assertTrue($invoice->fresh()->isPaid());

        // Check 5 allocations: PB 20% (10k), Prov 10% (5k), Kota 10% (5k), Dojo 20% (10k), Pelatih 40% (20k)
        $allocations = $invoice->allocations;
        $this->assertCount(5, $allocations);

        $pbAlloc = $allocations->firstWhere('beneficiary_type', BeneficiaryType::PbPerkemi);
        $provAlloc = $allocations->firstWhere('beneficiary_type', BeneficiaryType::Pengprov);
        $kotAlloc = $allocations->firstWhere('beneficiary_type', BeneficiaryType::Pengkot);
        $dojoAlloc = $allocations->firstWhere('beneficiary_type', BeneficiaryType::Dojo);
        $pelatihAlloc = $allocations->firstWhere('beneficiary_type', BeneficiaryType::Pelatih);

        $this->assertEquals(10000, $pbAlloc->amount);
        $this->assertEquals(5000, $provAlloc->amount);
        $this->assertEquals(5000, $kotAlloc->amount);
        $this->assertEquals(10000, $dojoAlloc->amount);
        $this->assertEquals(20000, $pelatihAlloc->amount);
    }

    public function test_ac02_proposing_fee_above_50000_sets_pending_pb(): void
    {
        $action = app(RequestDojoFeeSettingAction::class);
        $setting = $action->execute(
            $this->dojo,
            100000,
            '2026-11',
            'Penyesuaian fasilitas AC dojo',
            $this->sensei
        );

        $this->assertEquals(100000, $setting->amount);
        $this->assertEquals(FeeSettingStatus::PendingPB, $setting->status);
    }

    public function test_ac03_pb_approves_custom_fee_with_sk(): void
    {
        $setting = DojoFeeSetting::create([
            'dojo_id' => $this->dojo->id,
            'category' => 'kyukenshi',
            'amount' => 100000,
            'effective_from' => '2026-11',
            'status' => FeeSettingStatus::PendingPB,
            'requested_by' => $this->sensei->id,
        ]);

        $action = app(ApproveDojoFeeSettingAction::class);
        $approved = $action->execute($setting, $this->admin, 'SK-PB-088/2026');

        $this->assertEquals(FeeSettingStatus::Approved, $approved->status);
        $this->assertEquals('SK-PB-088/2026', $approved->approval_sk_number);

        // When invoice is generated with Rp100,000, allocations are 20k, 10k, 10k, 20k, 40k
        $invoice = Invoice::create([
            'kenshi_id' => $this->kenshiKyu->id,
            'dojo_id' => $this->dojo->id,
            'type' => InvoiceType::KyuMonthly,
            'period' => '2026-11',
            'amount' => 100000,
            'status' => InvoiceStatus::Unpaid,
            'due_date' => now()->toDateString(),
        ]);

        $recordAction = app(RecordPaymentAction::class);
        $recordAction->execute($invoice, 100000);

        $allocations = $invoice->allocations;
        $this->assertEquals(20000, $allocations->firstWhere('beneficiary_type', BeneficiaryType::PbPerkemi)->amount);
        $this->assertEquals(10000, $allocations->firstWhere('beneficiary_type', BeneficiaryType::Pengprov)->amount);
        $this->assertEquals(10000, $allocations->firstWhere('beneficiary_type', BeneficiaryType::Pengkot)->amount);
        $this->assertEquals(20000, $allocations->firstWhere('beneficiary_type', BeneficiaryType::Dojo)->amount);
        $this->assertEquals(40000, $allocations->firstWhere('beneficiary_type', BeneficiaryType::Pelatih)->amount);
    }

    public function test_ac05_yudansha_dues_allocates_100_percent_to_pb(): void
    {
        $invoice = Invoice::create([
            'kenshi_id' => $this->kenshiDan->id,
            'dojo_id' => $this->dojo->id,
            'type' => InvoiceType::DanMonthly,
            'period' => '2026-10',
            'amount' => 50000,
            'status' => InvoiceStatus::Unpaid,
            'due_date' => now()->toDateString(),
        ]);

        $action = app(RecordPaymentAction::class);
        $action->execute($invoice, 50000);

        $allocations = $invoice->allocations;
        $this->assertCount(1, $allocations);
        $this->assertEquals(BeneficiaryType::PbPerkemi, $allocations->first()->beneficiary_type);
        $this->assertEquals(50000, $allocations->first()->amount);
    }

    public function test_ac09_idempotent_payment_prevents_duplicate_allocations(): void
    {
        $invoice = Invoice::create([
            'kenshi_id' => $this->kenshiKyu->id,
            'dojo_id' => $this->dojo->id,
            'type' => InvoiceType::KyuMonthly,
            'period' => '2026-10',
            'amount' => 50000,
            'status' => InvoiceStatus::Unpaid,
            'due_date' => now()->toDateString(),
        ]);

        $action = app(RecordPaymentAction::class);
        $action->execute($invoice, 50000, 'bri_transfer', 'REF-UNIQUE-001');

        // Execute second time with same ref
        $action->execute($invoice, 50000, 'bri_transfer', 'REF-UNIQUE-001');

        $this->assertEquals(5, $invoice->allocations()->count());
    }

    public function test_ac11_kenshi_delinquent_12_months_becomes_inactive_temporary(): void
    {
        // Create 12 unpaid invoices
        for ($i = 1; $i <= 12; $i++) {
            Invoice::create([
                'kenshi_id' => $this->kenshiKyu->id,
                'dojo_id' => $this->dojo->id,
                'type' => InvoiceType::KyuMonthly,
                'period' => sprintf('2025-%02d', $i),
                'amount' => 50000,
                'status' => InvoiceStatus::Unpaid,
                'due_date' => now()->subMonths(13 - $i)->toDateString(),
            ]);
        }

        $this->assertTrue($this->kenshiKyu->isDelinquent12Months());

        $action = app(CheckDelinquencyAction::class);
        $isDelinquent = $action->execute($this->kenshiKyu);

        $this->assertTrue($isDelinquent);
        $this->assertFalse($this->kenshiKyu->fresh()->is_active);
        $this->assertDatabaseHas('kenshi_status_history', [
            'kenshi_id' => $this->kenshiKyu->id,
            'status' => 'inactive_temporary',
        ]);
    }

    public function test_admin_can_set_fee_once_for_all_dojos(): void
    {
        $dojo2 = Dojo::create([
            'code' => 'DOJO-SBY-TEST-02',
            'name' => 'Dojo Rungkut Surabaya',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Kota Surabaya',
            'status' => DojoStatus::Active,
        ]);

        $response = $this->actingAs($this->admin)->post('/dojo/settings/iuran', [
            'dojo_id' => $this->dojo->id,
            'amount' => 50000,
            'effective_from' => '2026-12',
            'change_reason' => 'Pengaturan global semua dojo',
            'apply_to_all_dojos' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('dojo_fee_settings', [
            'dojo_id' => $this->dojo->id,
            'amount' => 50000,
            'status' => FeeSettingStatus::Approved->value,
        ]);
        $this->assertDatabaseHas('dojo_fee_settings', [
            'dojo_id' => $dojo2->id,
            'amount' => 50000,
            'status' => FeeSettingStatus::Approved->value,
        ]);
    }

    public function test_dojo_fee_can_be_customized_per_dojo_independently(): void
    {
        // Custom fee 75k submitted by Sensei -> pending_pb
        $response = $this->actingAs($this->sensei)->post('/dojo/settings/iuran', [
            'dojo_id' => $this->dojo->id,
            'amount' => 75000,
            'effective_from' => '2026-12',
            'change_reason' => 'Penyesuaian fasilitas khusus dojo 1',
            'apply_to_all_dojos' => false,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('dojo_fee_settings', [
            'dojo_id' => $this->dojo->id,
            'amount' => 75000,
            'status' => FeeSettingStatus::PendingPB->value,
        ]);
    }

    public function test_pb_admin_can_configure_custom_allocation_percentages(): void
    {
        // PB Admin sets 25% PB, 10% Prov, 10% Kota, 15% Dojo, 40% Pelatih (Total 100%)
        $response = $this->actingAs($this->admin)->post('/dojo/settings/iuran', [
            'dojo_id' => $this->dojo->id,
            'amount' => 100000,
            'effective_from' => '2026-12',
            'change_reason' => 'Penyesuaian persentase kas dojo dan PB',
            'apply_to_all_dojos' => false,
            'rates' => [
                'pb' => 25,
                'pengprov' => 10,
                'pengkot' => 10,
                'dojo' => 15,
                'pelatih' => 40,
            ],
        ]);

        $response->assertSessionHas('success');

        $setting = DojoFeeSetting::where('dojo_id', $this->dojo->id)
            ->where('amount', 100000)
            ->first();

        $this->assertNotNull($setting);
        $this->assertEquals(FeeSettingStatus::Approved, $setting->status);
        $this->assertEquals(25, $setting->metadata['allocation_rates']['pb']);
        $this->assertEquals(15, $setting->metadata['allocation_rates']['dojo']);

        // Now test calculating allocation with this setting
        $invoice = Invoice::create([
            'kenshi_id' => $this->kenshiKyu->id,
            'dojo_id' => $this->dojo->id,
            'fee_setting_id' => $setting->id,
            'type' => InvoiceType::KyuMonthly,
            'period' => '2026-12',
            'amount' => 100000,
            'status' => InvoiceStatus::Unpaid,
            'due_date' => now()->toDateString(),
        ]);

        $calculateAction = app(CalculateAllocationAction::class);
        $allocations = $calculateAction->execute($invoice, 100000);

        // PB 25% (25.000), Prov 10% (10.000), Kota 10% (10.000), Dojo 15% (15.000), Pelatih 40% (40.000)
        $this->assertEquals(25000, $allocations->firstWhere('beneficiary_type', BeneficiaryType::PbPerkemi)->amount);
        $this->assertEquals(15000, $allocations->firstWhere('beneficiary_type', BeneficiaryType::Dojo)->amount);
        $this->assertEquals(40000, $allocations->firstWhere('beneficiary_type', BeneficiaryType::Pelatih)->amount);
    }
}
