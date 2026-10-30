<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\Pengurus;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PengurusOrganizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_pengkot_surabaya_admin_login_redirects_to_pengkot(): void
    {
        $user = User::factory()->create([
            'email' => 'pengkot.surabaya@perkemi.id',
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole('PengkabAdmin');

        $response = $this->post('/login', [
            'email' => 'pengkot.surabaya@perkemi.id',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/pengkot');
        $this->assertAuthenticatedAs($user);
    }

    public function test_pengprov_jatim_admin_login_redirects_to_pengprov(): void
    {
        $user = User::factory()->create([
            'email' => 'pengprov.jatim@perkemi.id',
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole('PengprovAdmin');

        $response = $this->post('/login', [
            'email' => 'pengprov.jatim@perkemi.id',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/pengprov');
        $this->assertAuthenticatedAs($user);
    }

    public function test_authenticated_user_can_view_pengkot_surabaya_profile(): void
    {
        $user = User::factory()->create();
        $user->assignRole('PengkabAdmin');

        $pengkot = Pengurus::create([
            'type' => 'pengkot',
            'name' => 'PERKEMI Pengkot Kota Surabaya',
            'code' => 'PENGKOT-SBY',
            'region' => 'Kota Surabaya',
            'user_id' => $user->id,
            'leader_name' => 'Sensei Surabaya',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->get('/pengkot');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Pengurus/Pengkot')
            ->has('pengkot')
            ->where('pengkot.name', 'PERKEMI Pengkot Kota Surabaya')
        );
    }

    public function test_authenticated_user_can_view_pengprov_jatim_profile(): void
    {
        $user = User::factory()->create();
        $user->assignRole('PengprovAdmin');

        $pengprov = Pengurus::create([
            'type' => 'pengprov',
            'name' => 'PERKEMI Pengprov Jawa Timur',
            'code' => 'PENGPROV-JATIM',
            'region' => 'Jawa Timur',
            'user_id' => $user->id,
            'leader_name' => 'Sensei Jawa Timur',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->get('/pengprov');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Pengurus/Pengprov')
            ->has('pengprov')
            ->where('pengprov.name', 'PERKEMI Pengprov Jawa Timur')
        );
    }

    public function test_register_creates_kenshi_linked_to_pengkot_and_pengprov(): void
    {
        $dojo = Dojo::create([
            'code' => 'DOJO-SBY-TEST',
            'name' => 'Dojo Surabaya Test',
            'pengkab' => 'Kota Surabaya',
            'pengprov' => 'Jawa Timur',
            'status' => 'active',
        ]);

        $pengkot = Pengurus::create([
            'type' => 'pengkot',
            'name' => 'Pengkot PERKEMI Kota Surabaya',
            'code' => 'PENGKOT-SBY',
            'region' => 'Kota Surabaya',
            'status' => 'active',
        ]);

        $pengprov = Pengurus::create([
            'type' => 'pengprov',
            'name' => 'Pengprov PERKEMI Jawa Timur',
            'code' => 'PENGPROV-JATIM',
            'region' => 'Jawa Timur',
            'status' => 'active',
        ]);

        $response = $this->post('/register', [
            'full_name' => 'Atlet Binaan Perkemi',
            'email' => 'atlet.binaan@perkemi.id',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'dojo_id' => $dojo->id,
            'gender' => 'M',
            'rank' => 'minarai',
            'is_atlet_pengkot' => true,
            'pengkot_id' => $pengkot->id,
            'pengkot' => 'Kota Surabaya',
            'is_atlet_pengprov' => true,
            'pengprov_id' => $pengprov->id,
            'pengprov' => 'Jawa Timur',
        ]);

        $response->assertRedirect('/portal/kenshi');

        $kenshi = Kenshi::where('full_name', 'Atlet Binaan Perkemi')->first();
        $this->assertNotNull($kenshi);
        $this->assertTrue((bool) $kenshi->is_atlet_pengkot);
        $this->assertTrue((bool) $kenshi->is_atlet_pengprov);
        $this->assertEquals($pengkot->id, $kenshi->pengkot_id);
        $this->assertEquals($pengprov->id, $kenshi->pengprov_id);
    }

    public function test_authorized_admin_can_update_pengurus_details(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('PengkabAdmin');

        $pengkot = Pengurus::create([
            'type' => 'pengkot',
            'name' => 'Pengkot PERKEMI Kota Surabaya',
            'code' => 'PENGKOT-SBY',
            'region' => 'Kota Surabaya',
            'user_id' => $admin->id,
            'leader_name' => 'Sensei Lama',
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)->put("/pengurus/{$pengkot->id}", [
            'leader_name' => 'Sensei Baru Surabaya',
            'secretary_name' => 'Senpai Hendra',
            'sk_number' => 'SK-BARU-2026',
            'sk_period' => '2026 - 2030',
            'contact_phone' => '081234567899',
            'contact_email' => 'sekretariat.sby@perkemi.id',
            'address' => 'Jl. Diponegoro No. 10, Surabaya',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('pengurus', [
            'id' => $pengkot->id,
            'leader_name' => 'Sensei Baru Surabaya',
            'secretary_name' => 'Senpai Hendra',
            'sk_number' => 'SK-BARU-2026',
        ]);
    }
}
