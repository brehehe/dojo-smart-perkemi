<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\DojoStatus;
use App\Enums\KenshiRank;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DojoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password123');

        // Sensei 1: Dojo Senayan
        $senseiSenayan = User::updateOrCreate(
            ['email' => 'sensei.senayan@perkemi.id'],
            [
                'name' => 'Sensei Budi Prasetyo (V Dan)',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ]
        );
        $senseiSenayan->syncRoles(['Sensei']);

        // Sensei 2: Dojo UGM
        $senseiUgm = User::updateOrCreate(
            ['email' => 'sensei.ugm@perkemi.id'],
            [
                'name' => 'Sensei Agus Santoso (IV Dan)',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ]
        );
        $senseiUgm->syncRoles(['Sensei']);

        // Sensei 3: PERKEMI Pengkot Surabaya
        $senseiSurabaya = User::updateOrCreate(
            ['email' => 'sensei.surabaya@perkemi.id'],
            [
                'name' => 'Sensei Hadi Siswanto (V Dan)',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ]
        );
        $senseiSurabaya->syncRoles(['Sensei']);

        // Dojo 1: Dojo Senayan PB Perkemi
        $dojoSenayan = Dojo::updateOrCreate(
            ['code' => 'DOJO-JKT-001'],
            [
                'name' => 'Dojo Senayan PB Perkemi',
                'pengprov' => 'DKI Jakarta',
                'pengkab' => 'Jakarta Pusat',
                'address' => 'Komplek Gelora Bung Karno, Senayan',
                'city' => 'Jakarta Pusat',
                'latitude' => -6.2185700,
                'longitude' => 106.8026100,
                'head_sensei_id' => $senseiSenayan->id,
                'contact_phone' => '081299887766',
                'contact_email' => 'senayan@perkemi.id',
                'status' => DojoStatus::Active,
                'metadata' => [
                    'schedule' => 'Selasa & Kamis (19:00 - 21:00), Sabtu (08:00 - 11:00)',
                    'tatami_capacity' => 60,
                    'google_maps_url' => 'https://www.google.com/maps?q=-6.2185700,106.8026100',
                ],
            ]
        );

        // Dojo 2: Dojo Gelanggang UGM
        $dojoUgm = Dojo::updateOrCreate(
            ['code' => 'DOJO-DIY-001'],
            [
                'name' => 'Dojo Gelanggang UGM',
                'pengprov' => 'D.I. Yogyakarta',
                'pengkab' => 'Sleman',
                'address' => 'Gelanggang Mahasiswa UGM, Jl. Pancasila No. 1',
                'city' => 'Sleman',
                'latitude' => -7.7712300,
                'longitude' => 110.3776200,
                'head_sensei_id' => $senseiUgm->id,
                'contact_phone' => '081322334455',
                'contact_email' => 'ugm@perkemi.id',
                'status' => DojoStatus::Active,
                'metadata' => [
                    'schedule' => 'Senin & Rabu (16:30 - 18:30), Minggu (07:00 - 10:00)',
                    'tatami_capacity' => 45,
                    'google_maps_url' => 'https://www.google.com/maps?q=-7.7712300,110.3776200',
                ],
            ]
        );

        // Dojo 3: PERKEMI Pengkot Surabaya
        $dojoSurabaya = Dojo::updateOrCreate(
            ['code' => 'DOJO-SBY-001'],
            [
                'name' => 'PERKEMI PENGKOT SURABAYA',
                'pengprov' => 'Jawa Timur',
                'pengkab' => 'Kota Surabaya',
                'address' => 'Komplek Olahraga Sawahan, Surabaya, Jawa Timur',
                'city' => 'Kota Surabaya',
                'latitude' => -7.3183485,
                'longitude' => 112.7177549,
                'head_sensei_id' => $senseiSurabaya->id,
                'contact_phone' => '081234567888',
                'contact_email' => 'pengkot.surabaya@perkemi.id',
                'status' => DojoStatus::Active,
                'metadata' => [
                    'schedule' => 'Senin & Kamis (19:00 - 21:00), Sabtu (08:00 - 11:00)',
                    'tatami_capacity' => 50,
                    'google_maps_url' => 'https://www.google.com/maps/place/PERKEMI+PENGKOT+SURABAYA/@-7.3183432,112.71518,17z/data=!3m1!4b1!4m6!3m5!1s0x2dd7fb00227da073:0x532d0de98e0269fa!8m2!3d-7.3183485!4d112.7177549!16s%2Fg%2F11zbh20q33',
                    'latitude' => -7.3183485,
                    'longitude' => 112.7177549,
                ],
            ]
        );

        // Kenshi 1: Arya Suryanegara (I Dan, Dojo Senayan)
        $userArya = User::updateOrCreate(
            ['email' => 'arya.kenshi@perkemi.id'],
            [
                'name' => 'Arya Suryanegara',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ]
        );
        $userArya->syncRoles(['Kenshi']);

        Kenshi::updateOrCreate(
            ['id_card_number' => 'KNS-2026-0001'],
            [
                'user_id' => $userArya->id,
                'dojo_id' => $dojoSenayan->id,
                'full_name' => 'Arya Suryanegara',
                'nickname' => 'Arya',
                'gender' => 'M',
                'place_of_birth' => 'Jakarta',
                'date_of_birth' => '2001-05-14',
                'blood_type' => 'O',
                'rank' => KenshiRank::Dan1,
                'phone' => '081234567890',
                'address' => 'Kebayoran Baru, Jakarta Selatan',
                'joined_at' => '2019-01-15',
                'is_active' => true,
                'metadata' => [
                    'attendance_rate' => 96,
                    'total_sessions' => 240,
                    'last_exam_date' => '2024-08-17',
                    'ready_for_ukt' => true,
                ],
            ]
        );

        // Kenshi 2: Dewi Anggraini (Kyu I, Dojo Senayan)
        $userDewi = User::updateOrCreate(
            ['email' => 'dewi.kenshi@perkemi.id'],
            [
                'name' => 'Dewi Anggraini',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ]
        );
        $userDewi->syncRoles(['Kenshi']);

        Kenshi::updateOrCreate(
            ['id_card_number' => 'KNS-2026-0002'],
            [
                'user_id' => $userDewi->id,
                'dojo_id' => $dojoSenayan->id,
                'full_name' => 'Dewi Anggraini',
                'nickname' => 'Dewi',
                'gender' => 'F',
                'place_of_birth' => 'Bandung',
                'date_of_birth' => '2003-09-22',
                'blood_type' => 'A',
                'rank' => KenshiRank::Kyu1,
                'phone' => '081298765432',
                'address' => 'Tebet, Jakarta Selatan',
                'joined_at' => '2021-03-10',
                'is_active' => true,
                'metadata' => [
                    'attendance_rate' => 92,
                    'total_sessions' => 180,
                    'last_exam_date' => '2025-02-10',
                    'ready_for_ukt' => true,
                ],
            ]
        );

        // Kenshi 3: Fajar Wicaksono (Kyu II, Dojo UGM)
        $userFajar = User::updateOrCreate(
            ['email' => 'fajar.kenshi@perkemi.id'],
            [
                'name' => 'Fajar Wicaksono',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ]
        );
        $userFajar->syncRoles(['Kenshi']);

        Kenshi::updateOrCreate(
            ['id_card_number' => 'KNS-2026-0003'],
            [
                'user_id' => $userFajar->id,
                'dojo_id' => $dojoUgm->id,
                'full_name' => 'Fajar Wicaksono',
                'nickname' => 'Fajar',
                'gender' => 'M',
                'place_of_birth' => 'Yogyakarta',
                'date_of_birth' => '2004-11-08',
                'blood_type' => 'B',
                'rank' => KenshiRank::Kyu2,
                'phone' => '087711223344',
                'address' => 'Kaliurang KM 5, Sleman',
                'joined_at' => '2022-08-01',
                'is_active' => true,
                'metadata' => [
                    'attendance_rate' => 88,
                    'total_sessions' => 140,
                    'last_exam_date' => '2025-06-20',
                    'ready_for_ukt' => false,
                ],
            ]
        );

        // Add additional kenshis for Dojo Senayan to enrich the analytics
        $additionalSenayan = [
            ['KNS-2026-0004', 'Rizky Pratama', 'Rizky', 'M', KenshiRank::Dan2, true, '2017-04-10', 98],
            ['KNS-2026-0005', 'Siti Rahmawati', 'Rahma', 'F', KenshiRank::Kyu3, true, '2023-01-12', 85],
            ['KNS-2026-0006', 'Bambang Sudiro', 'Bambang', 'M', KenshiRank::Kyu5, true, '2023-09-05', 82],
            ['KNS-2026-0007', 'Gita Permata', 'Gita', 'F', KenshiRank::Minarai, true, '2026-01-15', 90],
            ['KNS-2026-0008', 'Hendro Wijaya', 'Hendro', 'M', KenshiRank::Kyu4, false, '2022-03-20', 45],
        ];

        foreach ($additionalSenayan as [$idCard, $name, $nick, $gender, $rank, $isActive, $joinedAt, $attRate]) {
            Kenshi::updateOrCreate(
                ['id_card_number' => $idCard],
                [
                    'dojo_id' => $dojoSenayan->id,
                    'full_name' => $name,
                    'nickname' => $nick,
                    'gender' => $gender,
                    'rank' => $rank,
                    'member_type' => $rank->isDan() ? 'coach' : 'athlete',
                    'is_active' => $isActive,
                    'joined_at' => $joinedAt,
                    'metadata' => [
                        'attendance_rate' => $attRate,
                        'total_sessions' => rand(30, 200),
                    ],
                ]
            );
        }

        // Surabaya Pelatih (Sensei / Coach)
        $pelatihSurabaya = User::updateOrCreate(
            ['email' => 'pelatih.surabaya@perkemi.id'],
            [
                'name' => 'Dimas Anggoro (III Dan)',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ]
        );
        $pelatihSurabaya->syncRoles(['Sensei']);

        Kenshi::updateOrCreate(
            ['id_card_number' => 'PEL-SBY-001'],
            [
                'user_id' => $pelatihSurabaya->id,
                'dojo_id' => $dojoSurabaya->id,
                'full_name' => 'Dimas Anggoro',
                'nickname' => 'Sensei Dimas',
                'gender' => 'M',
                'place_of_birth' => 'Surabaya',
                'date_of_birth' => '1990-04-12',
                'blood_type' => 'O',
                'rank' => KenshiRank::Dan3,
                'member_type' => 'coach',
                'phone' => '081234567999',
                'address' => 'Rungkut, Kota Surabaya',
                'joined_at' => '2012-05-10',
                'is_active' => true,
                'metadata' => [
                    'license_number' => 'LIC-PEL-2024-089',
                    'specialization' => 'Goju Ittai & Embu Beregu',
                    'attendance_rate' => 99,
                    'total_sessions' => 380,
                ],
            ]
        );

        // Surabaya Atlet / Kenshi (Default password = NIK)
        $surabayaKenshis = [
            ['KNS-SBY-001', 'Bayu Pratama Wijaya', 'Bayu', 'M', KenshiRank::Dan1, 'athlete', '081345678001', 'Sawahan, Kota Surabaya'],
            ['KNS-SBY-002', 'Siti Nurhaliza Putri', 'Liza', 'F', KenshiRank::Kyu1, 'athlete', '081345678002', 'Wonokromo, Kota Surabaya'],
            ['KNS-SBY-003', 'Ahmad Farhan', 'Farhan', 'M', KenshiRank::Kyu2, 'athlete', '081345678003', 'Tegalsari, Kota Surabaya'],
            ['KNS-SBY-004', 'Dinda Ayu Maharani', 'Dinda', 'F', KenshiRank::Kyu3, 'athlete', '081345678004', 'Gubeng, Kota Surabaya'],
        ];

        foreach ($surabayaKenshis as [$idCard, $name, $nick, $gender, $rank, $mType, $phone, $address]) {
            $kenshiUser = User::updateOrCreate(
                ['email' => strtolower(str_replace('-', '', $idCard)).'@kenshi.perkemi.id'],
                [
                    'name' => $name,
                    'password' => Hash::make($idCard), // Password default NIK
                    'email_verified_at' => now(),
                ]
            );
            $kenshiUser->syncRoles(['Kenshi']);

            Kenshi::updateOrCreate(
                ['id_card_number' => $idCard],
                [
                    'user_id' => $kenshiUser->id,
                    'dojo_id' => $dojoSurabaya->id,
                    'full_name' => $name,
                    'nickname' => $nick,
                    'gender' => $gender,
                    'rank' => $rank,
                    'member_type' => $mType,
                    'phone' => $phone,
                    'address' => $address,
                    'is_active' => true,
                    'joined_at' => '2023-01-10',
                    'metadata' => [
                        'attendance_rate' => rand(85, 98),
                        'total_sessions' => rand(60, 210),
                    ],
                ]
            );
        }
    }
}
