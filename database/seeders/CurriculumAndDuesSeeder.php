<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ExaminationStatus;
use App\Enums\FeeSettingStatus;
use App\Enums\KenshiRank;
use App\Enums\MaterialPillar;
use App\Models\Dojo;
use App\Models\DojoFeeSetting;
use App\Models\Examination;
use App\Models\Material;
use App\Models\User;
use Illuminate\Database\Seeder;

class CurriculumAndDuesSeeder extends Seeder
{
    /**
     * Seed curriculum materials, fee policies, and examination events.
     */
    public function run(): void
    {
        $admin = User::first();
        $dojos = Dojo::all();

        // 1. Seed Curriculum Materials
        $sampleMaterials = [
            [
                'title' => 'Dokuhon Bab I: Falsafah Sejohun & Janji Kenshi',
                'slug' => 'dokuhon-bab-1-falsafah-sejohun',
                'pillar' => MaterialPillar::Dokuhon,
                'target_rank' => KenshiRank::Minarai,
                'summary' => 'Pedoman penghayatan filosofi Shorinji Kempo, etika dojo (reigi), dan janji kenshi untuk pemula.',
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'video_duration' => '08:45',
                'video_chapters' => [
                    ['title' => 'Pembacaan Sejohun', 'timestamp' => '00:00', 'seconds' => 0],
                    ['title' => 'Kaidah Etika Reigi', 'timestamp' => '03:15', 'seconds' => 195],
                    ['title' => 'Janji Kenshi PERKEMI', 'timestamp' => '06:00', 'seconds' => 360],
                ],
                'is_official_pb' => true,
                'is_public' => true,
                'order_priority' => 1,
            ],
            [
                'title' => 'Kihon Waza: Kuda-kuda (Kamae) & Pukulan Dasar (Tsuki)',
                'slug' => 'kihon-waza-kamae-tsuki-dasar',
                'pillar' => MaterialPillar::Kihon,
                'target_rank' => KenshiRank::Minarai,
                'summary' => 'Latihan posisi kuda-kuda kokutsu dachi, fudo dachi, dan teknik sentakan pukulan jodan tsuki.',
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'video_duration' => '12:20',
                'video_chapters' => [
                    ['title' => 'Kuda-kuda Kokutsu Dachi', 'timestamp' => '00:00', 'seconds' => 0],
                    ['title' => 'Jodan & Chudan Tsuki', 'timestamp' => '04:30', 'seconds' => 270],
                    ['title' => 'Tenaga Sentakan Kime', 'timestamp' => '08:50', 'seconds' => 530],
                ],
                'is_official_pb' => true,
                'is_public' => false,
                'order_priority' => 2,
            ],
            [
                'title' => 'Goho Waza: Uwa Uke Zuki & Tenshin Geri',
                'slug' => 'goho-waza-uwa-uke-zuki-tenshin-geri',
                'pillar' => MaterialPillar::Goho,
                'target_rank' => KenshiRank::Kyu7,
                'summary' => 'Kombinasi tangkisan atas dengan serangan balik pukulan dan tendangan geser samping.',
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'video_duration' => '15:10',
                'video_chapters' => [
                    ['title' => 'Uwa Uke Zuki', 'timestamp' => '00:00', 'seconds' => 0],
                    ['title' => 'Ashi Sabaki Tenshin', 'timestamp' => '05:20', 'seconds' => 320],
                    ['title' => 'Tenshin Geri Counter', 'timestamp' => '10:00', 'seconds' => 600],
                ],
                'is_official_pb' => true,
                'is_public' => false,
                'order_priority' => 3,
            ],
            [
                'title' => 'Juho Waza: Kote Nuki & Maki Gote Lanjutan',
                'slug' => 'juho-waza-kote-nuki-maki-gote',
                'pillar' => MaterialPillar::Juho,
                'target_rank' => KenshiRank::Kyu5,
                'summary' => 'Teknik lepasan cengkeraman pergelangan tangan dan kuncian putar pergelangan tangan.',
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'video_duration' => '14:05',
                'video_chapters' => [
                    ['title' => 'Titik Kyusho Pegangan', 'timestamp' => '00:00', 'seconds' => 0],
                    ['title' => 'Kote Nuki Release', 'timestamp' => '04:10', 'seconds' => 250],
                    ['title' => 'Maki Gote Pinning', 'timestamp' => '08:30', 'seconds' => 510],
                ],
                'is_official_pb' => true,
                'is_public' => false,
                'order_priority' => 4,
            ],
            [
                'title' => 'Tandoku Embu Silabus Ujian I Dan Yudansha',
                'slug' => 'tandoku-embu-silabus-i-dan',
                'pillar' => MaterialPillar::Embu,
                'target_rank' => KenshiRank::Dan1,
                'summary' => 'Koreografi resmi rangkaian Embu perorangan untuk syarat kelulusan sabuk hitam I Dan.',
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'video_duration' => '18:40',
                'video_chapters' => [
                    ['title' => 'Urutan Komposisi 6 Rangkaian', 'timestamp' => '00:00', 'seconds' => 0],
                    ['title' => 'Irama Maai & Kiai', 'timestamp' => '07:15', 'seconds' => 435],
                    ['title' => 'Zanshin & Penghormatan Akhir', 'timestamp' => '14:00', 'seconds' => 840],
                ],
                'is_official_pb' => true,
                'is_public' => false,
                'order_priority' => 5,
            ],
        ];

        foreach ($sampleMaterials as $mat) {
            Material::updateOrCreate(
                ['slug' => $mat['slug']],
                array_merge($mat, [
                    'uploader_id' => $admin?->id,
                    'is_active' => true,
                ])
            );
        }

        // 2. Seed Standard Approved Fee Setting (Rp50,000) for dojos
        foreach ($dojos as $dojo) {
            DojoFeeSetting::firstOrCreate(
                [
                    'dojo_id' => $dojo->id,
                    'category' => 'kyukenshi',
                    'effective_from' => '2026-01',
                ],
                [
                    'amount' => 50000,
                    'status' => FeeSettingStatus::Approved,
                    'requested_by' => $admin?->id,
                    'requested_at' => now(),
                    'approved_by' => $admin?->id,
                    'approved_at' => now(),
                    'approval_sk_number' => 'SK-PB-045/SK-PB/VII/2025',
                ]
            );
        }

        // 3. Seed Scheduled Examination
        Examination::firstOrCreate(
            ['title' => 'Ujian Kenaikan Tingkat (UKT) Semester Genap Pengkot Surabaya 2026'],
            [
                'level_scope' => 'pengkot_kyu',
                'location_name' => 'Gedung Olahraga Sawahan, Kota Surabaya',
                'date' => now()->addDays(14)->toDateString(),
                'start_time' => '08:00',
                'end_time' => '16:00',
                'quota' => 60,
                'status' => ExaminationStatus::RegistrationOpen,
                'sk_number' => 'SK-UKT-SBY-2026-01',
                'notes' => 'Peserta wajib lunas iuran, presensi minimal 16 sesi, dan seragam dogi lengkap.',
            ]
        );
    }
}
