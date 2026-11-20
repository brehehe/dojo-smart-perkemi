<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\DojoStatus;
use App\Enums\KenshiRank;
use App\Enums\MaterialPillar;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\Material;
use App\Models\Pengurus;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MaterialHierarchyAndMediaUploadTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $pengprovUser;

    private User $pengkabUser;

    private User $sensei;

    private User $kenshiUserA;

    private Pengurus $pengprovJatim;

    private Pengurus $pengkotSby;

    private Dojo $dojoA;

    private Dojo $dojoB;

    private Kenshi $kenshiA;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        Storage::fake('public');

        $this->superAdmin = User::first();

        // 1. Pengprov Jawa Timur
        $this->pengprovUser = User::factory()->create();
        $this->pengprovUser->assignRole('PengprovAdmin');

        $this->pengprovJatim = Pengurus::create([
            'type' => 'pengprov',
            'name' => 'Pengprov Perkemi Jawa Timur',
            'code' => 'PENGPROV-JATIM',
            'region' => 'Jawa Timur',
            'user_id' => $this->pengprovUser->id,
            'status' => 'active',
        ]);

        // 2. Pengkot Surabaya
        $this->pengkabUser = User::factory()->create();
        $this->pengkabUser->assignRole('PengkabAdmin');

        $this->pengkotSby = Pengurus::create([
            'type' => 'pengkot',
            'name' => 'Pengkot Perkemi Surabaya',
            'code' => 'PENGKOT-SBY',
            'region' => 'Kota Surabaya',
            'user_id' => $this->pengkabUser->id,
            'status' => 'active',
        ]);

        // 3. Dojo A (Surabaya, Jatim) managed by Sensei
        $this->sensei = User::factory()->create();
        $this->sensei->assignRole('Sensei');

        $this->dojoA = Dojo::create([
            'code' => 'DOJO-SBY-01',
            'name' => 'Dojo Unair Surabaya',
            'pengprov' => 'Jawa Timur',
            'pengkab' => 'Kota Surabaya',
            'head_sensei_id' => $this->sensei->id,
            'status' => DojoStatus::Active,
        ]);

        // 4. Dojo B (Bandung, Jabar)
        $this->dojoB = Dojo::create([
            'code' => 'DOJO-BDG-01',
            'name' => 'Dojo ITB Bandung',
            'pengprov' => 'Jawa Barat',
            'pengkab' => 'Kota Bandung',
            'status' => DojoStatus::Active,
        ]);

        // 5. Kenshi A registered in Dojo A (Surabaya, Jatim) with Kyu 1 rank
        $this->kenshiUserA = User::factory()->create();
        $this->kenshiUserA->assignRole('Kenshi');

        $this->kenshiA = Kenshi::create([
            'user_id' => $this->kenshiUserA->id,
            'id_card_number' => 'KNS-SBY-001',
            'dojo_id' => $this->dojoA->id,
            'pengprov_id' => $this->pengprovJatim->id,
            'pengkot_id' => $this->pengkotSby->id,
            'pengprov' => 'Jawa Timur',
            'pengkot' => 'Kota Surabaya',
            'full_name' => 'Kenshi Airlangga',
            'gender' => 'M',
            'rank' => KenshiRank::Kyu1,
            'is_active' => true,
        ]);
    }

    public function test_superadmin_can_upload_national_dokuhon_pdf_with_flipbook_pages(): void
    {
        $fakePdf = UploadedFile::fake()->create('dokuhon-sejohun.pdf', 1024, 'application/pdf');

        $response = $this->actingAs($this->superAdmin)->post('/dojo/materi', [
            'title' => 'Dokuhon Nasional Falsafah Kempo',
            'pillar' => 'dokuhon',
            'target_rank' => 'minarai',
            'scope_type' => 'national',
            'pdf_file' => $fakePdf,
            'summary' => 'Buku Falsafah Sejohun dan Janji Kenshi resmi PB PERKEMI',
        ]);

        $response->assertRedirect();

        $material = Material::where('title', 'Dokuhon Nasional Falsafah Kempo')->first();
        $this->assertNotNull($material);
        $this->assertEquals('national', $material->scope_type);
        $this->assertTrue($material->is_official_pb);
        $this->assertEquals('pdf', $material->media_type);
        $this->assertNotNull($material->pdf_path);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $material->pdf_path));
    }

    public function test_pengprov_admin_can_upload_provincial_scoped_video(): void
    {
        $fakeVideo = UploadedFile::fake()->create('pelatda-jatim.mp4', 5000, 'video/mp4');

        $response = $this->actingAs($this->pengprovUser)->post('/dojo/materi', [
            'title' => 'Video Drill Pelatda Kempo PON Jatim',
            'pillar' => 'goho',
            'target_rank' => 'dan_1',
            'scope_type' => 'pengprov',
            'video_file' => $fakeVideo,
            'video_duration' => '15:20',
            'summary' => 'Materi khusus atlet Pelatda Jawa Timur',
        ]);

        $response->assertRedirect();

        $material = Material::where('title', 'Video Drill Pelatda Kempo PON Jatim')->first();
        $this->assertNotNull($material);
        $this->assertEquals('pengprov', $material->scope_type);
        $this->assertEquals($this->pengprovJatim->id, $material->pengprov_id);
        $this->assertFalse($material->is_official_pb);
        $this->assertEquals('video', $material->media_type);
        $this->assertNotNull($material->video_url);
    }

    public function test_pengkab_admin_can_upload_city_scoped_material(): void
    {
        $response = $this->actingAs($this->pengkabUser)->post('/dojo/materi', [
            'title' => 'Syllabus Latihan Bersama Pengkot Surabaya',
            'pillar' => 'juho',
            'target_rank' => 'kyu_3',
            'scope_type' => 'pengkot',
            'video_url' => 'https://www.youtube.com/watch?v=example123',
            'video_duration' => '08:30',
            'summary' => 'Pemusatan latihan cabang Surabaya',
        ]);

        $response->assertRedirect();

        $material = Material::where('title', 'Syllabus Latihan Bersama Pengkot Surabaya')->first();
        $this->assertNotNull($material);
        $this->assertEquals('pengkot', $material->scope_type);
        $this->assertEquals($this->pengkotSby->id, $material->pengkot_id);
    }

    public function test_sensei_can_upload_dojo_scoped_dual_media(): void
    {
        $fakePdf = UploadedFile::fake()->create('drill-dojo-unair.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->sensei)->post('/dojo/materi', [
            'dojo_id' => $this->dojoA->id,
            'title' => 'Modul Drill Kote Nuki Dojo Unair',
            'pillar' => 'juho',
            'target_rank' => 'kyu_1',
            'video_url' => 'https://www.youtube.com/watch?v=dojo123',
            'video_duration' => '11:45',
            'pdf_file' => $fakePdf,
            'summary' => 'Latihan teknis khusus kenshi Dojo Unair',
        ]);

        $response->assertRedirect();

        $material = Material::where('title', 'Modul Drill Kote Nuki Dojo Unair')->first();
        $this->assertNotNull($material);
        $this->assertEquals('dojo', $material->scope_type);
        $this->assertEquals($this->dojoA->id, $material->dojo_id);
        $this->assertEquals('both', $material->media_type);
    }

    public function test_kenshi_only_sees_hierarchy_scoped_materials_in_directory(): void
    {
        // 1. National PB material (Kyu 1 rank -> accessible for Kenshi A)
        $nationalMaterial = Material::create([
            'title' => 'Kihon Waza Nasional',
            'slug' => 'kihon-waza-nasional',
            'pillar' => MaterialPillar::Kihon,
            'target_rank' => KenshiRank::Kyu1,
            'scope_type' => 'national',
            'is_official_pb' => true,
            'is_active' => true,
        ]);

        // 2. Pengprov Jatim material (accessible for Kenshi A)
        $jatimMaterial = Material::create([
            'title' => 'Embu Bersama Jatim',
            'slug' => 'embu-bersama-jatim',
            'pillar' => MaterialPillar::Embu,
            'target_rank' => KenshiRank::Kyu1,
            'scope_type' => 'pengprov',
            'pengprov_id' => $this->pengprovJatim->id,
            'is_official_pb' => false,
            'is_active' => true,
        ]);

        // 3. Dojo A material (accessible for Kenshi A)
        $dojoAMaterial = Material::create([
            'title' => 'Latihan Rutin Dojo Unair',
            'slug' => 'latihan-rutin-dojo-unair',
            'pillar' => MaterialPillar::Goho,
            'target_rank' => KenshiRank::Kyu1,
            'scope_type' => 'dojo',
            'dojo_id' => $this->dojoA->id,
            'is_official_pb' => false,
            'is_active' => true,
        ]);

        // 4. Dojo B material (NOT accessible for Kenshi A)
        $dojoBMaterial = Material::create([
            'title' => 'Rahasia Teknik Dojo ITB',
            'slug' => 'rahasia-teknik-dojo-itb',
            'pillar' => MaterialPillar::Goho,
            'target_rank' => KenshiRank::Kyu1,
            'scope_type' => 'dojo',
            'dojo_id' => $this->dojoB->id,
            'is_official_pb' => false,
            'is_active' => true,
        ]);

        // Access /materials as Kenshi A
        $response = $this->actingAs($this->kenshiUserA)->get('/materials');
        $response->assertStatus(200);

        $response->assertInertia(function ($page) use ($nationalMaterial, $jatimMaterial, $dojoAMaterial, $dojoBMaterial) {
            $pageMaterials = collect($page->toArray()['props']['materials']);
            $materialIds = $pageMaterials->pluck('id')->toArray();

            $this->assertContains($nationalMaterial->id, $materialIds);
            $this->assertContains($jatimMaterial->id, $materialIds);
            $this->assertContains($dojoAMaterial->id, $materialIds);
            $this->assertNotContains($dojoBMaterial->id, $materialIds);
        });
    }

    public function test_material_show_page_renders_flipbook_pages(): void
    {
        $material = Material::create([
            'title' => 'Dokuhon Bab I & II Flipbook',
            'slug' => 'dokuhon-flipbook-test',
            'pillar' => MaterialPillar::Dokuhon,
            'target_rank' => KenshiRank::Minarai,
            'scope_type' => 'national',
            'is_official_pb' => true,
            'media_type' => 'pdf',
            'is_active' => true,
            'is_public' => true,
        ]);

        $response = $this->actingAs($this->kenshiUserA)->get("/materials/{$material->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Materials/Show')
            ->has('material.pages_data')
            ->where('material.media_type', 'pdf')
        );
    }
}
