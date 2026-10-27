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

class MultiRolePortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('SuperAdmin', 'web');
        Role::findOrCreate('Sensei', 'web');
        Role::findOrCreate('Kenshi', 'web');
    }

    public function test_sensei_can_access_my_dojo_analytics(): void
    {
        $sensei = User::factory()->create();
        $sensei->assignRole('Sensei');

        $dojo = Dojo::create([
            'code' => 'DOJO-TST-01',
            'name' => 'Dojo Senayan Test',
            'pengprov' => 'DKI Jakarta',
            'pengkab' => 'Jakarta Pusat',
            'head_sensei_id' => $sensei->id,
            'status' => DojoStatus::Active,
        ]);

        Kenshi::create([
            'id_card_number' => 'KNS-TEST-001',
            'dojo_id' => $dojo->id,
            'full_name' => 'Kenshi Binaan',
            'gender' => 'M',
            'rank' => KenshiRank::Dan1,
            'is_active' => true,
        ]);

        $response = $this->actingAs($sensei)->get('/my-dojo');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dojos/Analytics')
            ->has('dojo')
            ->has('stats')
            ->has('roster')
        );
    }

    public function test_kenshi_can_access_personal_portal_and_kta(): void
    {
        $kenshiUser = User::factory()->create();
        $kenshiUser->assignRole('Kenshi');

        $dojo = Dojo::create([
            'code' => 'DOJO-TST-02',
            'name' => 'Dojo UGM Test',
            'pengprov' => 'D.I. Yogyakarta',
            'pengkab' => 'Sleman',
            'status' => DojoStatus::Active,
        ]);

        $kenshi = Kenshi::create([
            'user_id' => $kenshiUser->id,
            'id_card_number' => 'KNS-TEST-002',
            'dojo_id' => $dojo->id,
            'full_name' => 'Bintang Perkemi',
            'gender' => 'M',
            'rank' => KenshiRank::Kyu1,
            'is_active' => true,
        ]);

        $response = $this->actingAs($kenshiUser)->get('/portal/kenshi');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Kenshis/Portal')
            ->has('kenshi')
            ->has('roadmap')
            ->has('cardSecurityHash')
        );
    }

    public function test_guest_is_redirected_to_login_from_my_dojo(): void
    {
        $response = $this->get('/my-dojo');

        $response->assertRedirect('/login');
    }
}
