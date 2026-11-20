<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Actions\Material\ToggleMaterialProgressAction;
use App\Enums\DojoStatus;
use App\Enums\KenshiRank;
use App\Enums\MaterialPillar;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\Material;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaterialAndCurriculumTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $sensei;

    private User $kenshiUser;

    private Dojo $dojo;

    private Kenshi $kenshi;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::first();

        $this->sensei = User::factory()->create();
        $this->sensei->assignRole('Sensei');

        $this->dojo = Dojo::create([
            'code' => 'DOJO-MAT-01',
            'name' => 'Dojo Senayan Jakarta',
            'pengprov' => 'DKI Jakarta',
            'pengkab' => 'Jakarta Pusat',
            'head_sensei_id' => $this->sensei->id,
            'status' => DojoStatus::Active,
        ]);

        $this->kenshiUser = User::factory()->create();
        $this->kenshiUser->assignRole('Kenshi');

        $this->kenshi = Kenshi::create([
            'user_id' => $this->kenshiUser->id,
            'id_card_number' => 'KNS-MAT-001',
            'dojo_id' => $this->dojo->id,
            'full_name' => 'Kenshi Pemula',
            'gender' => 'M',
            'rank' => KenshiRank::Minarai,
            'is_active' => true,
        ]);
    }

    public function test_can_view_materials_index_page(): void
    {
        Material::create([
            'title' => 'Dokuhon Sejohun',
            'slug' => 'dokuhon-sejohun',
            'pillar' => MaterialPillar::Dokuhon,
            'target_rank' => KenshiRank::Minarai,
            'summary' => 'Falsafah dasar',
            'is_active' => true,
            'is_public' => true,
        ]);

        $response = $this->actingAs($this->kenshiUser)->get('/materials');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Materials/Index')
            ->has('materials')
            ->has('pillars')
            ->has('ranks')
        );
    }

    public function test_kenshi_can_toggle_material_progress(): void
    {
        $material = Material::create([
            'title' => 'Kihon Kuda-kuda',
            'slug' => 'kihon-kuda-kuda',
            'pillar' => MaterialPillar::Kihon,
            'target_rank' => KenshiRank::Minarai,
            'is_active' => true,
        ]);

        $action = app(ToggleMaterialProgressAction::class);
        $progress = $action->execute($this->kenshi, $material);

        $this->assertTrue($progress->is_completed);
        $this->assertNotNull($progress->completed_at);

        // Toggle again
        $progress2 = $action->execute($this->kenshi, $material);
        $this->assertFalse($progress2->is_completed);
    }

    public function test_sensei_can_upload_custom_dojo_material(): void
    {
        $response = $this->actingAs($this->sensei)->post('/dojo/materi', [
            'dojo_id' => $this->dojo->id,
            'title' => 'Drill Kote Nuki Malam',
            'pillar' => 'juho',
            'target_rank' => 'kyu_1',
            'video_url' => 'https://youtube.com/watch?v=123',
            'video_duration' => '10:00',
            'summary' => 'Koreksi latihan malam',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('materials', [
            'dojo_id' => $this->dojo->id,
            'title' => 'Drill Kote Nuki Malam',
            'is_official_pb' => false,
        ]);
    }
}
