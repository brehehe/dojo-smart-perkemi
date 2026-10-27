<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\DojoStatus;
use App\Enums\KenshiRank;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class KenshiManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('SuperAdmin', 'web');
    }

    public function test_can_view_kenshis_index_page(): void
    {
        $response = $this->get('/kenshis');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Kenshis/Index'));
    }

    public function test_can_view_kenshi_create_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        Dojo::create([
            'code' => 'DOJO-TEST-001',
            'name' => 'Dojo Jakarta',
            'pengprov' => 'DKI Jakarta',
            'pengkab' => 'Jakarta Selatan',
            'status' => DojoStatus::Active,
        ]);

        $response = $this->actingAs($admin)->get('/kenshis/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Kenshis/Create')
            ->has('dojos')
            ->has('ranks')
        );
    }

    public function test_can_view_kenshi_edit_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $dojo = Dojo::create([
            'code' => 'DOJO-TEST-002',
            'name' => 'Dojo Bandung',
            'pengprov' => 'Jawa Barat',
            'pengkab' => 'Bandung',
            'status' => DojoStatus::Active,
        ]);

        $kenshi = Kenshi::create([
            'id_card_number' => 'KNS-TEST-999',
            'dojo_id' => $dojo->id,
            'full_name' => 'Bambang Sudiro',
            'nickname' => 'Bambang',
            'gender' => 'M',
            'rank' => KenshiRank::Kyu5,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get("/kenshis/{$kenshi->id}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Kenshis/Edit')
            ->has('kenshi')
            ->has('dojos')
            ->has('ranks')
        );
    }

    public function test_can_view_kenshi_show_page(): void
    {
        $dojo = Dojo::create([
            'code' => 'DOJO-TEST-003',
            'name' => 'Dojo Surabaya',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Surabaya',
            'status' => DojoStatus::Active,
        ]);

        $kenshi = Kenshi::create([
            'id_card_number' => 'KNS-TEST-888',
            'dojo_id' => $dojo->id,
            'full_name' => 'Siti Rahma',
            'gender' => 'F',
            'rank' => KenshiRank::Dan1,
            'is_active' => true,
        ]);

        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->get("/kenshis/{$kenshi->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Kenshis/Show')
            ->has('kenshi')
        );
    }

    public function test_can_create_kenshi_with_pengkot_and_pengprov_athlete_status(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $dojo = Dojo::create([
            'code' => 'DOJO-SBY-ATLET',
            'name' => 'Dojo Atlet Surabaya',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Kota Surabaya',
            'status' => DojoStatus::Active,
        ]);

        $response = $this->actingAs($admin)->post('/kenshis', [
            'id_card_number' => 'KNS-ATLET-01',
            'dojo_id' => $dojo->id,
            'full_name' => 'Aditya Pratama',
            'gender' => 'M',
            'rank' => 'kyu_1',
            'member_type' => 'athlete',
            'is_atlet_pengkot' => true,
            'pengkot' => 'Kota Surabaya',
            'is_atlet_pengprov' => true,
            'pengprov' => 'Jawa Timur',
            'create_user_account' => false,
        ]);

        $response->assertRedirect('/kenshis');
        $this->assertDatabaseHas('kenshis', [
            'id_card_number' => 'KNS-ATLET-01',
            'full_name' => 'Aditya Pratama',
            'is_atlet_pengkot' => true,
            'pengkot' => 'Kota Surabaya',
            'is_atlet_pengprov' => true,
            'pengprov' => 'Jawa Timur',
        ]);
    }

    public function test_can_register_new_kenshi_with_athlete_options(): void
    {
        Role::findOrCreate('Kenshi', 'web');

        $dojo = Dojo::create([
            'code' => 'DOJO-REGIS-01',
            'name' => 'Dojo Pendaftaran',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Kota Surabaya',
            'status' => DojoStatus::Active,
        ]);

        $response = $this->post('/register', [
            'full_name' => 'Bintang Perkemi',
            'dojo_id' => $dojo->id,
            'gender' => 'M',
            'rank' => 'minarai',
            'is_atlet_pengkot' => true,
            'pengkot' => 'Kota Surabaya',
            'is_atlet_pengprov' => false,
            'email' => 'bintang@perkemi.id',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect(route('kenshis.portal'));
        $this->assertDatabaseHas('users', ['email' => 'bintang@perkemi.id']);
        $this->assertDatabaseHas('kenshis', [
            'full_name' => 'Bintang Perkemi',
            'is_atlet_pengkot' => true,
            'pengkot' => 'Kota Surabaya',
        ]);
    }
}
