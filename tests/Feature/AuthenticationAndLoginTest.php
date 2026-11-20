<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthenticationAndLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'SuperAdmin']);
        Role::firstOrCreate(['name' => 'PengprovAdmin']);
        Role::firstOrCreate(['name' => 'PengkabAdmin']);
        Role::firstOrCreate(['name' => 'Sensei']);
        Role::firstOrCreate(['name' => 'Kenshi']);
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Auth/Login'));
    }

    public function test_authenticated_user_visiting_login_is_redirected_by_role(): void
    {
        $user = User::factory()->create();
        $user->assignRole('SuperAdmin');

        $response = $this->actingAs($user)->get('/login');

        $response->assertRedirect('/dashboard');
    }

    public function test_user_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@perkemi.id',
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole('SuperAdmin');

        $response = $this->post('/login', [
            'email' => 'admin@perkemi.id',
            'password' => 'password123',
            'remember' => true,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/dojos');
    }

    public function test_user_cannot_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'kenshi@perkemi.id',
            'password' => bcrypt('correct-password'),
        ]);

        $response = $this->post('/login', [
            'email' => 'kenshi@perkemi.id',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_user_can_logout_and_session_is_invalidated(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/login');
    }
}
