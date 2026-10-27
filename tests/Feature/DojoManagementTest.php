<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Dojo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DojoManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('SuperAdmin', 'web');
    }

    public function test_can_view_dojos_index_page(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->get('/dojos');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dojos/Index'));
    }

    public function test_can_create_a_new_dojo(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->post('/dojos', [
            'code' => 'DOJO-TEST-001',
            'name' => 'Dojo Uji Coba Jakarta',
            'pengprov' => 'DKI Jakarta',
            'pengkab' => 'Jakarta Selatan',
            'status' => 'active',
        ]);

        $response->assertRedirect('/dojos');
        $this->assertDatabaseHas('dojos', [
            'code' => 'DOJO-TEST-001',
            'name' => 'Dojo Uji Coba Jakarta',
        ]);
    }

    public function test_cannot_create_dojo_without_required_fields(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->post('/dojos', []);

        $response->assertSessionHasErrors(['code', 'name', 'pengprov', 'pengkab', 'status']);
    }

    public function test_can_soft_delete_dojo(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $dojo = Dojo::create([
            'code' => 'DOJO-DEL-01',
            'name' => 'Dojo Hapus',
            'pengprov' => 'Jawa Barat',
            'pengkab' => 'Depok',
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)->delete("/dojos/{$dojo->id}");

        $response->assertRedirect('/dojos');
        $this->assertSoftDeleted('dojos', ['id' => $dojo->id]);
    }
}
