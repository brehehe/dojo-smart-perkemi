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
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DojoCsvSeeder extends Seeder
{
    /**
     * Run the database seeds from dojo.csv.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Ensure Sensei role exists
        Role::findOrCreate('Sensei', 'web');

        $defaultPassword = Hash::make('password123');
        $csvPath = database_path('seeders/csvs/dojo.csv');

        if (! file_exists($csvPath)) {
            $this->command->error("CSV file not found at: {$csvPath}");

            return;
        }

        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            $this->command->error("Unable to open CSV file at: {$csvPath}");

            return;
        }

        $header = fgetcsv($handle, escape: '\\');
        if (! $header) {
            fclose($handle);

            return;
        }

        // Clean UTF-8 BOM and whitespace from header columns
        $header = array_map(function (string $col): string {
            return trim(preg_replace('/[\x{FEFF}]/u', '', $col));
        }, $header);

        while (($data = fgetcsv($handle, escape: '\\')) !== false) {
            if (empty($data) || (count($data) === 1 && $data[0] === null)) {
                continue;
            }

            // Pad row if trailing empty columns are missing in CSV
            if (count($data) < count($header)) {
                $data = array_pad($data, count($header), '');
            }

            $row = array_combine($header, $data);

            $kodeDojo = trim($row['Kode Dojo'] ?? '');
            $namaDojo = trim($row['Nama Dojo'] ?? '');

            if ($kodeDojo === '' || $namaDojo === '') {
                continue;
            }

            // Resolve Cabang & Provinsi column which may have newline in header
            $cabangProvinsi = '';
            foreach ($row as $key => $val) {
                if (str_contains($key, 'Cabang')) {
                    $cabangProvinsi = trim((string) $val);
                    break;
                }
            }

            $parts = explode('-', $cabangProvinsi);
            $cabangRaw = trim($parts[0] ?? 'Surabaya Kota');
            $provinsi = trim($parts[1] ?? 'Jawa Timur');
            $pengkab = str_contains(strtolower($cabangRaw), 'surabaya') ? 'Kota Surabaya' : $cabangRaw;

            $namaKetua = trim($row['Nama Ketua'] ?? '');
            $rawStatus = trim($row['Status'] ?? 'Aktif');
            $isActive = strtolower($rawStatus) === 'aktif';
            $dojoStatus = $isActive ? DojoStatus::Active : DojoStatus::Inactive;

            // Deterministic unique email for Dojo Head Sensei / Admin
            $cleanCode = strtolower(str_replace(['.', '-', ' '], '', $kodeDojo));
            $email = "dojo.{$cleanCode}@perkemi.id";

            if ($namaKetua !== '') {
                $userName = (
                    str_starts_with($namaKetua, 'Dr.')
                    || str_starts_with($namaKetua, 'Ir.')
                    || str_starts_with($namaKetua, 'Sensei')
                    || str_starts_with($namaKetua, 'Senpai')
                ) ? $namaKetua : "Sensei {$namaKetua}";
            } else {
                $userName = "Sensei {$namaDojo}";
            }

            // 1. Create / Update User Account for Head Sensei / Dojo Admin
            $senseiUser = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $userName,
                    'password' => $defaultPassword,
                    'email_verified_at' => now(),
                ]
            );
            $senseiUser->syncRoles(['Sensei']);

            // 2. Prepare Metadata from CSV
            $suratPersetujuan = trim($row['Surat Persetujuan PB / Prov'] ?? '');
            $tglPersetujuan = trim($row['Tanggal Persetujuan'] ?? '');
            $skPengukuhan = trim($row['SK Pengukuhan'] ?? '');
            $tglSkPengukuhan = trim($row['Tanggal SK Pengukuhan'] ?? '');
            $masaBakti = trim($row['Masa Bakti'] ?? '');
            $tglBerakhir = trim($row['Tanggal Berakhir'] ?? '');
            $hariBerakhir = trim($row['Hari Berakhir'] ?? '');

            $metadata = array_filter([
                'surat_persetujuan' => $suratPersetujuan !== '' ? $suratPersetujuan : null,
                'tanggal_persetujuan' => $tglPersetujuan !== '' ? $tglPersetujuan : null,
                'sk_pengukuhan' => $skPengukuhan !== '' ? $skPengukuhan : null,
                'tanggal_sk_pengukuhan' => $tglSkPengukuhan !== '' ? $tglSkPengukuhan : null,
                'masa_bakti' => $masaBakti !== '' ? $masaBakti : null,
                'tanggal_berakhir' => $tglBerakhir !== '' ? $tglBerakhir : null,
                'hari_berakhir' => $hariBerakhir !== '' ? $hariBerakhir : null,
                'nama_ketua' => $namaKetua !== '' ? $namaKetua : null,
                'google_maps_url' => null,
            ], fn ($v) => $v !== null);

            // 3. Create / Update Dojo
            $dojo = Dojo::updateOrCreate(
                ['code' => $kodeDojo],
                [
                    'name' => $namaDojo,
                    'pengprov' => $provinsi,
                    'pengkab' => $pengkab,
                    'address' => "{$namaDojo}, {$pengkab}, {$provinsi}",
                    'city' => $pengkab,
                    'head_sensei_id' => $senseiUser->id,
                    'contact_phone' => null,
                    'contact_email' => $email,
                    'status' => $dojoStatus,
                    'radius_meters' => 100,
                    'metadata' => $metadata,
                ]
            );

            // 4. For active dojos with designated Sensei, create/update Coach Kenshi profile
            if ($isActive) {
                Kenshi::updateOrCreate(
                    ['id_card_number' => "PEL-{$cleanCode}"],
                    [
                        'user_id' => $senseiUser->id,
                        'dojo_id' => $dojo->id,
                        'full_name' => $namaKetua !== '' ? $namaKetua : $userName,
                        'nickname' => $namaKetua !== '' ? $namaKetua : $userName,
                        'gender' => 'M',
                        'rank' => KenshiRank::Dan3,
                        'member_type' => 'coach',
                        'pengkot' => $pengkab,
                        'pengprov' => $provinsi,
                        'joined_at' => '2024-01-01',
                        'is_active' => true,
                        'metadata' => [
                            'specialization' => 'Pelatih / Ketua Dojo',
                            'masa_bakti' => $masaBakti !== '' ? $masaBakti : null,
                        ],
                    ]
                );
            }
        }

        fclose($handle);
    }
}

