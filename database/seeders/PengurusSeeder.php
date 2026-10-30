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

class PengurusSeeder extends Seeder
{
    /**
     * Seed accounts, organizations, and permissions for Pengkot (PengkabAdmin) and Pengprov (PengprovAdmin).
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Ensure roles exist
        $pengprovRole = Role::findOrCreate('PengprovAdmin', 'web');
        $pengkabRole = Role::findOrCreate('PengkabAdmin', 'web');

        // Permissions for PengprovAdmin
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

        // Permissions for PengkabAdmin (Pengkot)
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

        // 1. User & Organisasi Pengurus Pengprov Jawa Timur
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

        // 2. User & Organisasi Pengurus Pengkot Surabaya
        $pengkotUser = User::updateOrCreate(
            ['email' => 'pengkot.surabaya@perkemi.id'],
            [
                'name' => 'Pengurus Pengkot PERKEMI Surabaya',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ]
        );
        $pengkotUser->syncRoles(['PengkabAdmin']);

        $pengkotOrg = Pengurus::updateOrCreate(
            ['code' => 'PENGKOT-SBY'],
            [
                'type' => 'pengkot',
                'name' => 'PERKEMI Pengkot Kota Surabaya',
                'region' => 'Kota Surabaya',
                'user_id' => $pengkotUser->id,
                'sk_number' => 'SK-PENGPROV-045/JATIM/2024',
                'sk_period' => '2024 - 2028',
                'leader_name' => 'Sensei Dr. H. M. Yasin, S.T., M.T. (V Dan)',
                'secretary_name' => 'Senpai Budi Santoso, S.Kom (III Dan)',
                'contact_phone' => '081234567892',
                'contact_email' => 'pengkot.surabaya@perkemi.id',
                'address' => 'Gedung Gelora Pancasila, Jl. Indragiri No. 2, Kota Surabaya',
                'status' => 'active',
                'metadata' => [
                    'motto' => 'Surabaya Wani Berprestasi',
                    'target_porprov' => 'Pertahankan Juara Umum Porprov',
                ],
            ]
        );

        // Associate existing athletes to their respective Pengkot & Pengprov
        Kenshi::where('is_atlet_pengkot', true)
            ->whereNull('pengkot_id')
            ->update(['pengkot_id' => $pengkotOrg->id, 'pengkot' => 'Kota Surabaya']);

        Kenshi::where('is_atlet_pengprov', true)
            ->whereNull('pengprov_id')
            ->update(['pengprov_id' => $pengprovOrg->id, 'pengprov' => 'Jawa Timur']);
    }
}
