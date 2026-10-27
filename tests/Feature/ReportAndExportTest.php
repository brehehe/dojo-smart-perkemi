<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\DojoStatus;
use App\Enums\KenshiRank;
use App\Jobs\ExportReportJob;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ReportAndExportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('SuperAdmin', 'web');
        Role::findOrCreate('Sensei', 'web');
        Role::findOrCreate('Kenshi', 'web');
    }

    public function test_can_view_reports_index_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->get('/reports');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Reports/Index')
            ->has('metrics')
        );
    }

    public function test_can_view_coaches_page(): void
    {
        $response = $this->get('/coaches');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Kenshis/Index')
            ->where('isCoachOnly', true)
        );
    }

    public function test_can_dispatch_report_export_to_queue(): void
    {
        Queue::fake();

        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->postJson('/reports/export', [
            'type' => 'dojo',
            'format' => 'excel',
            'mode' => 'queue',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'status' => 'pending',
        ]);

        Queue::assertPushed(ExportReportJob::class);
    }

    public function test_kenshi_creation_sets_default_password_to_nik(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $dojo = Dojo::create([
            'code' => 'DOJO-SBY-001',
            'name' => 'PERKEMI PENGKOT SURABAYA',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Surabaya',
            'latitude' => -7.3183485,
            'longitude' => 112.7177549,
            'status' => DojoStatus::Active,
        ]);

        $nik = '3578010101900001';
        $email = 'atlet.surabaya@perkemi.id';

        $response = $this->actingAs($admin)->post('/kenshis', [
            'dojo_id' => $dojo->id,
            'id_card_number' => $nik,
            'full_name' => 'Kenshi Baru Surabaya',
            'gender' => 'M',
            'rank' => KenshiRank::Kyu1->value,
            'member_type' => 'athlete',
            'email' => $email,
            'create_user_account' => true,
            'address' => 'Jl. Kertajaya Indah No. 10 Surabaya',
            'is_active' => true,
        ]);

        $response->assertRedirect('/kenshis');

        $createdUser = User::where('email', $email)->first();
        $this->assertNotNull($createdUser);
        $this->assertTrue(Hash::check($nik, $createdUser->password));
    }

    public function test_dojo_pengkot_surabaya_coordinates_are_saved(): void
    {
        $dojo = Dojo::create([
            'code' => 'DOJO-SBY-MAP',
            'name' => 'PERKEMI PENGKOT SURABAYA',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Kota Surabaya',
            'latitude' => -7.3183485,
            'longitude' => 112.7177549,
            'status' => DojoStatus::Active,
        ]);

        $this->assertEquals(-7.3183485, $dojo->latitude);
        $this->assertEquals(112.7177549, $dojo->longitude);
    }

    public function test_can_dispatch_evaluation_and_promotion_exports(): void
    {
        Queue::fake();

        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $responseEval = $this->actingAs($admin)->postJson('/reports/export', [
            'type' => 'evaluation',
            'format' => 'excel',
            'mode' => 'queue',
        ]);
        $responseEval->assertStatus(200);

        $responsePromo = $this->actingAs($admin)->postJson('/reports/export', [
            'type' => 'promotion',
            'format' => 'pdf',
            'mode' => 'queue',
        ]);
        $responsePromo->assertStatus(200);

        Queue::assertPushed(ExportReportJob::class, 2);
    }

    public function test_authorized_user_can_promote_kenshi_rank(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $dojo = Dojo::create([
            'code' => 'DOJO-SBY-TEST-PROMO',
            'name' => 'Dojo Test Promosi',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Surabaya',
            'latitude' => -7.3183,
            'longitude' => 112.7177,
            'status' => DojoStatus::Active,
        ]);

        $kenshi = Kenshi::create([
            'dojo_id' => $dojo->id,
            'id_card_number' => '3578010101900091',
            'full_name' => 'Kenshi Promosi Test',
            'gender' => 'M',
            'rank' => KenshiRank::Kyu2,
            'member_type' => 'athlete',
            'address' => 'Surabaya',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post("/promotions/{$kenshi->id}/promote");

        $response->assertRedirect();
        $kenshi->refresh();
        $this->assertEquals(KenshiRank::Kyu1, $kenshi->rank);
    }

    public function test_unauthorized_user_cannot_promote_kenshi_rank(): void
    {
        $kenshiUser = User::factory()->create();
        $kenshiUser->assignRole('Kenshi');

        $dojo = Dojo::create([
            'code' => 'DOJO-SBY-TEST-PROMO-2',
            'name' => 'Dojo Test Promosi 2',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Surabaya',
            'latitude' => -7.3183,
            'longitude' => 112.7177,
            'status' => DojoStatus::Active,
        ]);

        $targetKenshi = Kenshi::create([
            'dojo_id' => $dojo->id,
            'id_card_number' => '3578010101900092',
            'full_name' => 'Kenshi Target Test',
            'gender' => 'M',
            'rank' => KenshiRank::Kyu2,
            'member_type' => 'athlete',
            'address' => 'Surabaya',
            'is_active' => true,
        ]);

        $response = $this->actingAs($kenshiUser)->post("/promotions/{$targetKenshi->id}/promote");

        $response->assertStatus(403);
        $targetKenshi->refresh();
        $this->assertEquals(KenshiRank::Kyu2, $targetKenshi->rank);
    }
}
