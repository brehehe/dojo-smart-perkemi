<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Kenshi;
use App\Models\Pengurus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PengurusCsvSeeder extends Seeder
{
    /**
     * Run the database seeds from pengkotdanpengprov.csv.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Ensure roles exist
        $pengprovRole = Role::findOrCreate('PengprovAdmin', 'web');
        $pengkabRole = Role::findOrCreate('PengkabAdmin', 'web');

        $pengprovPermissions = [
            'dojo.view',
            'dojo.create',
            'dojo.update',
            'kenshi.view',
            'kenshi.manage',
            'kenshi.export',
            'ukt.view',
            'ukt.evaluate',
            'attendance.view',
        ];
        foreach ($pengprovPermissions as $perm) {
            Permission::findOrCreate($perm, 'web');
        }
        $pengprovRole->syncPermissions($pengprovPermissions);

        $pengkabPermissions = [
            'dojo.view',
            'dojo.create',
            'dojo.update',
            'kenshi.view',
            'kenshi.manage',
            'kenshi.export',
            'attendance.view',
            'attendance.checkin',
            'ukt.view',
        ];
        foreach ($pengkabPermissions as $perm) {
            Permission::findOrCreate($perm, 'web');
        }
        $pengkabRole->syncPermissions($pengkabPermissions);

        $defaultPassword = Hash::make('password123');

        // 2. Ensure parent Pengprov Jawa Timur exists
        $pengprovUser = User::updateOrCreate(
            ['email' => 'pengprov.jatim@perkemi.id'],
            [
                'name' => 'Pengurus Pengprov PERKEMI Jawa Timur',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ]
        );
        $pengprovUser->syncRoles(['PengprovAdmin']);

        $pengprovOrg = Pengurus::updateOrCreate(
            ['code' => 'PENGPROV-JATIM'],
            [
                'type' => 'pengprov',
                'name' => 'PERKEMI Pengprov Jawa Timur',
                'region' => 'Jawa Timur',
                'user_id' => $pengprovUser->id,
                'sk_number' => 'SK-PB-023/PERKEMI/2024',
                'sk_period' => '2024 - 2028',
                'leader_name' => 'Sensei Ir. H. Bambang Supeno, M.Si (VI Dan)',
                'secretary_name' => 'Senpai Hendra Setiawan, S.Pd (IV Dan)',
                'contact_phone' => '081234567891',
                'contact_email' => 'pengprov.jatim@perkemi.id',
                'address' => 'Komplek GOR Kertajaya Indah No. 1, Kota Surabaya, Jawa Timur',
                'status' => 'active',
                'metadata' => [
                    'motto' => 'Jawa Timur Kompak & Berprestasi',
                    'target_pon' => 'Juara Umum PON Kempo',
                ],
            ]
        );

        // 3. Read and seed branches from pengkotdanpengprov.csv
        $csvPath = database_path('seeders/csvs/pengkotdanpengprov.csv');

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

            if (count($data) < count($header)) {
                $data = array_pad($data, count($header), '');
            }

            $row = array_combine($header, $data);

            $rawCode = trim($row['Kode'] ?? '');
            if ($rawCode === '') {
                continue;
            }

            // Normalize regional code (e.g. 13,01 -> 13.01, 13,1 -> 13.10, 13,2 -> 13.20)
            $normalizedCode = str_replace(',', '.', $rawCode);
            if ($normalizedCode === '13.1') {
                $normalizedCode = '13.10';
            } elseif ($normalizedCode === '13.2') {
                $normalizedCode = '13.20';
            }

            $rawCabang = trim($row['Cabang'] ?? '');
            $cabangClean = trim(str_ireplace(['(persiapan)'], '', $rawCabang));
            $isKab = str_contains(strtolower($cabangClean), 'kab');
            $baseCityName = trim(str_ireplace(['kab.', 'kab', 'kota'], '', $cabangClean));
            $slug = strtolower(str_replace(' ', '', $baseCityName));

            $typePrefix = $isKab ? 'pengkab' : 'pengkot';
            $email = "{$typePrefix}.{$slug}@perkemi.id";

            // Keep compatibility with PENGKOT-SBY identifier for Surabaya Kota
            $isSurabaya = $normalizedCode === '13.01' || str_contains(strtolower($cabangClean), 'surabaya');
            $code = $isSurabaya ? 'PENGKOT-SBY' : $normalizedCode;
            $region = $isSurabaya ? 'Kota Surabaya' : $cabangClean;

            $orgPrefix = $isKab ? 'Pengkab' : 'Pengkot';
            $orgName = "PERKEMI {$orgPrefix} ".($isSurabaya ? 'Kota Surabaya' : $cabangClean);

            $leaderName = trim($row['Nama Ketua'] ?? '');
            $userName = $leaderName !== '' ? $leaderName : "Pengurus {$orgName}";

            // 4. Create / Update User Account with PengkabAdmin role
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $userName,
                    'password' => $defaultPassword,
                    'email_verified_at' => now(),
                ]
            );
            $user->syncRoles(['PengkabAdmin']);

            // 5. Parse Status
            $rawStatus = trim($row['Status'] ?? 'Aktif');
            $status = match (strtolower($rawStatus)) {
                'aktif' => 'active',
                'tidak aktif' => 'inactive',
                'persiapan' => 'persiapan',
                default => 'inactive',
            };

            // 6. Parse SK numbers and period
            $skPersetujuan = trim($row['SK Persetujuan'] ?? '');
            $tglSkPersetujuan = trim($row['Tanggal SK Persetujuan'] ?? '');
            $skPengukuhan = trim($row['SK Pengukuhan'] ?? '');
            $tglSkPengukuhan = trim($row['Tanggal SK Pengukuhan'] ?? '');
            $masaBakti = trim($row['Masa Bakti'] ?? '');
            $tglBerakhir = trim($row['Tanggal Berakhir'] ?? '');
            $hariBerakhir = trim($row['Hari Berakhir'] ?? '');

            $skNumber = $skPengukuhan !== '' ? $skPengukuhan : ($skPersetujuan !== '' ? $skPersetujuan : null);
            $skPeriod = $masaBakti !== '' ? $masaBakti : null;

            $metadata = array_filter([
                'kode_wilayah' => $rawCode,
                'kode_normal' => $normalizedCode,
                'sk_persetujuan' => $skPersetujuan !== '' ? $skPersetujuan : null,
                'tanggal_sk_persetujuan' => $tglSkPersetujuan !== '' ? $tglSkPersetujuan : null,
                'sk_pengukuhan' => $skPengukuhan !== '' ? $skPengukuhan : null,
                'tanggal_sk_pengukuhan' => $tglSkPengukuhan !== '' ? $tglSkPengukuhan : null,
                'masa_bakti' => $skPeriod,
                'tanggal_berakhir' => $tglBerakhir !== '' ? $tglBerakhir : null,
                'hari_berakhir' => $hariBerakhir !== '' ? $hariBerakhir : null,
            ], fn ($v) => $v !== null);

            // 7. Create / Update Pengkot / Pengkab Record
            Pengurus::updateOrCreate(
                ['code' => $code],
                [
                    'type' => 'pengkot',
                    'name' => $orgName,
                    'region' => $region,
                    'user_id' => $user->id,
                    'sk_number' => $skNumber,
                    'sk_period' => $skPeriod,
                    'leader_name' => $leaderName !== '' ? $leaderName : null,
                    'secretary_name' => null,
                    'contact_phone' => null,
                    'contact_email' => $email,
                    'address' => "Sekretariat {$orgName}, {$region}, Jawa Timur",
                    'status' => $status,
                    'metadata' => $metadata,
                ]
            );
        }

        fclose($handle);

        // 8. Associate existing athletes to respective Pengkot & Pengprov
        $surabayaOrgId = Pengurus::where('code', 'PENGKOT-SBY')->value('id');
        if ($surabayaOrgId) {
            Kenshi::where('is_atlet_pengkot', true)
                ->whereNull('pengkot_id')
                ->update(['pengkot_id' => $surabayaOrgId, 'pengkot' => 'Kota Surabaya']);
        }

        Kenshi::where('is_atlet_pengprov', true)
            ->whereNull('pengprov_id')
            ->update(['pengprov_id' => $pengprovOrg->id, 'pengprov' => 'Jawa Timur']);
    }
}
