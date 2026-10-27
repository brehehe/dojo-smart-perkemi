<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test root redirects to dashboard.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertRedirect('/dashboard');
    }

    /**
     * Test national executive dashboard returns 200 OK.
     */
    public function test_dashboard_renders_successfully(): void
    {
        $response = $this->get('/dashboard');

        $response->assertOk();
    }
}
