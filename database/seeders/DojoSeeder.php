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

        // Sensei Kepala: PERKEMI Pengkot Surabaya
        $senseiSurabaya = User::updateOrCreate(
            ['email' => 'sensei.surabaya@perkemi.id'],
            [
                'name' => 'Sensei Hadi Siswanto (V Dan)',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ]
        );
        $senseiSurabaya->syncRoles(['Sensei']);

        // Dojo Tunggal: PERKEMI Pengkot Surabaya
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

        // Pelatih Dojo Surabaya (Sensei / Coach)
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

        // Kenshi / Atlet Dojo Surabaya
        $surabayaKenshis = [
            ['KNS-SBY-001', 'Bayu Pratama Wijaya', 'Bayu', 'M', KenshiRank::Dan1, 'athlete', '081345678001', 'Sawahan, Kota Surabaya', '2019-02-10', 96, 240, true],
            ['KNS-SBY-002', 'Siti Nurhaliza Putri', 'Liza', 'F', KenshiRank::Kyu1, 'athlete', '081345678002', 'Wonokromo, Kota Surabaya', '2021-04-15', 92, 180, true],
            ['KNS-SBY-003', 'Ahmad Farhan', 'Farhan', 'M', KenshiRank::Kyu2, 'athlete', '081345678003', 'Tegalsari, Kota Surabaya', '2022-06-20', 88, 140, false],
            ['KNS-SBY-004', 'Dinda Ayu Maharani', 'Dinda', 'F', KenshiRank::Kyu3, 'athlete', '081345678004', 'Gubeng, Kota Surabaya', '2022-11-05', 85, 110, false],
            ['KNS-SBY-005', 'Rizky Maulana', 'Rizky', 'M', KenshiRank::Kyu4, 'athlete', '081345678005', 'Kenjeran, Kota Surabaya', '2023-03-12', 90, 85, false],
            ['KNS-SBY-006', 'Anisa Rahmadani', 'Anisa', 'F', KenshiRank::Kyu5, 'athlete', '081345678006', 'Sukolilo, Kota Surabaya', '2023-08-18', 82, 60, false],
            ['KNS-SBY-007', 'Budi Santoso', 'Budi', 'M', KenshiRank::Minarai, 'athlete', '081345678007', 'Tambaksari, Kota Surabaya', '2024-01-10', 95, 30, false],
            ['KNS-SBY-008', 'Tri Wahyudi', 'Yudi', 'M', KenshiRank::Dan2, 'athlete', '081345678008', 'Mulyorejo, Kota Surabaya', '2017-09-01', 98, 310, true],
        ];

        foreach ($surabayaKenshis as [$idCard, $name, $nick, $gender, $rank, $mType, $phone, $address, $joinedAt, $attRate, $sessions, $readyUkt]) {
            $userEmail = strtolower(str_replace('-', '', $idCard)).'@kenshi.perkemi.id';
            $kenshiUser = User::updateOrCreate(
                ['email' => $userEmail],
                [
                    'name' => $name,
                    'password' => $defaultPassword,
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
                    'joined_at' => $joinedAt,
                    'is_active' => true,
                    'metadata' => [
                        'attendance_rate' => $attRate,
                        'total_sessions' => $sessions,
                        'ready_for_ukt' => $readyUkt,
                    ],
                ]
            );
        }
    }
}
