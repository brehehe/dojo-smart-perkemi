<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleBasedNavigationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $permissions = [
            'dojo.view',
            'dojo.create',
            'dojo.update',
            'kenshi.view',
            'kenshi.manage',
            'attendance.view',
            'attendance.checkin',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $superAdmin = Role::findOrCreate('SuperAdmin', 'web');
        $pengprovAdmin = Role::findOrCreate('PengprovAdmin', 'web');
        $sensei = Role::findOrCreate('Sensei', 'web');
        $kenshi = Role::findOrCreate('Kenshi', 'web');

        $pengprovAdmin->syncPermissions([
            'dojo.view',
            'dojo.create',
            'dojo.update',
            'kenshi.view',
            'kenshi.manage',
            'attendance.view',
        ]);

        $sensei->syncPermissions([
            'dojo.view',
            'kenshi.view',
            'kenshi.manage',
            'attendance.view',
            'attendance.checkin',
        ]);

        $kenshi->syncPermissions([
            'dojo.view',
            'kenshi.view',
            'attendance.view',
        ]);
    }

    public function test_super_admin_receives_all_navigation_abilities(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('auth.user.can.dojo_create', true)
            ->where('auth.user.can.kenshi_create', true)
            ->where('auth.user.can.view_reports', true)
            ->where('auth.user.can.view_finance', true)
            ->where('auth.user.can.view_system_logs', true)
            ->where('auth.user.can.view_my_dojo', true)
            ->where('auth.user.can.view_kta_portal', true)
        );
    }

    public function test_sensei_cannot_create_dojo_or_view_system_logs(): void
    {
        $senseiUser = User::factory()->create();
        $senseiUser->assignRole('Sensei');

        $response = $this->actingAs($senseiUser)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('auth.user.can.dojo_create', false)
            ->where('auth.user.can.view_system_logs', false)
            ->where('auth.user.can.kenshi_create', true)
            ->where('auth.user.can.view_my_dojo', true)
            ->where('auth.user.can.view_reports', true)
            ->where('auth.user.can.view_finance', true)
        );
    }

    public function test_kenshi_athlete_has_restricted_permissions(): void
    {
        $athlete = User::factory()->create();
        $athlete->assignRole('Kenshi');

        $response = $this->actingAs($athlete)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('auth.user.can.dojo_create', false)
            ->where('auth.user.can.kenshi_create', false)
            ->where('auth.user.can.view_reports', false)
            ->where('auth.user.can.view_finance', false)
            ->where('auth.user.can.view_system_logs', false)
            ->where('auth.user.can.view_my_dojo', false)
            ->where('auth.user.can.view_kta_portal', true)
        );
    }

    public function test_guest_user_has_null_auth(): void
    {
        $response = $this->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('auth.user', null)
        );
    }

    public function test_can_access_module_hub_routes(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SuperAdmin');

        $this->actingAs($admin)->get('/performance/independent')->assertStatus(200);
        $this->actingAs($admin)->get('/performance/wellness')->assertStatus(200);
        $this->actingAs($admin)->get('/performance/physical')->assertStatus(200);
        $this->actingAs($admin)->get('/performance/technical')->assertStatus(200);
        $this->actingAs($admin)->get('/competitions')->assertStatus(200);
        $this->actingAs($admin)->get('/ai-intelligence')->assertStatus(200);
        $this->actingAs($admin)->get('/promotions')->assertStatus(200);
        $this->actingAs($admin)->get('/finance')->assertStatus(200);
    }
}
