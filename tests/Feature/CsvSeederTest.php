<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\DojoStatus;
use App\Models\Dojo;
use App\Models\Pengurus;
use App\Models\User;
use Database\Seeders\DojoCsvSeeder;
use Database\Seeders\PengurusCsvSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CsvSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_dojo_csv_seeder_imports_dojos_and_creates_logins(): void
    {
        $this->seed(DojoCsvSeeder::class);

        // Verify dojos count (28 rows in dojo.csv)
        $this->assertGreaterThanOrEqual(28, Dojo::count());

        // Verify specific active dojo: Univ. Airlangga (UNAIR)
        $unairDojo = Dojo::where('code', '13.01.04')->first();
        $this->assertNotNull($unairDojo);
        $this->assertSame('Univ. Airlangga (UNAIR)', $unairDojo->name);
        $this->assertSame(DojoStatus::Active, $unairDojo->status);
        $this->assertNotNull($unairDojo->headSensei);

        // Verify login for this dojo's head sensei
        $senseiUser = User::where('email', 'dojo.130104@perkemi.id')->first();
        $this->assertNotNull($senseiUser);
        $this->assertTrue($senseiUser->hasRole('Sensei'));

        // Test login request
        $response = $this->post('/login', [
            'email' => 'dojo.130104@perkemi.id',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('dojos.analytics'));
        $this->assertAuthenticatedAs($senseiUser);
    }

    public function test_pengurus_csv_seeder_imports_branches_and_creates_logins(): void
    {
        $this->seed(PengurusCsvSeeder::class);

        // Verify pengurus count (1 Pengprov + 23 branches in pengkotdanpengprov.csv)
        $this->assertGreaterThanOrEqual(24, Pengurus::count());

        // Verify Pengkot Kediri Kota exists
        $kediriOrg = Pengurus::where('code', '13.02')->first();
        $this->assertNotNull($kediriOrg);
        $this->assertSame('Pengkot PERKEMI Kediri Kota', $kediriOrg->name);
        $this->assertSame('Kediri Kota', $kediriOrg->region);
        $this->assertSame('Cecep Sunarya, S.Kom', $kediriOrg->leader_name);
        $this->assertSame('active', $kediriOrg->status);

        // Verify login account for Kediri Kota admin
        $kediriUser = User::where('email', 'pengkot.kediri@perkemi.id')->first();
        $this->assertNotNull($kediriUser);
        $this->assertTrue($kediriUser->hasRole('PengkabAdmin'));

        // Test login request
        $response = $this->post('/login', [
            'email' => 'pengkot.kediri@perkemi.id',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('pengkot.index'));
        $this->assertAuthenticatedAs($kediriUser);
    }

    public function test_pengurus_csv_seeder_supports_pengkab_branch(): void
    {
        $this->seed(PengurusCsvSeeder::class);

        // Verify Pengkab Jember exists with code 13.10
        $jemberOrg = Pengurus::where('code', '13.10')->first();
        $this->assertNotNull($jemberOrg);
        $this->assertSame('Pengkab PERKEMI Jember Kab.', $jemberOrg->name);

        // Verify login account for Jember Kab admin
        $jemberUser = User::where('email', 'pengkab.jember@perkemi.id')->first();
        $this->assertNotNull($jemberUser);
        $this->assertTrue($jemberUser->hasRole('PengkabAdmin'));
    }
}
