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
}
