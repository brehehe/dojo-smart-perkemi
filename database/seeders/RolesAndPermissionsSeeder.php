<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions list
        $permissions = [
            'dojo.view',
            'dojo.create',
            'dojo.update',
            'dojo.delete',
            'dojo.restore',
            'dojo.force_delete',
            'kenshi.view',
            'kenshi.manage',
            'kenshi.export',
            'ukt.view',
            'ukt.evaluate',
            'ukt.certify',
            'attendance.view',
            'attendance.checkin',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Roles definition
        $superAdmin = Role::findOrCreate('SuperAdmin', 'web');
        $pengprovAdmin = Role::findOrCreate('PengprovAdmin', 'web');
        $pengkabAdmin = Role::findOrCreate('PengkabAdmin', 'web');
        $sensei = Role::findOrCreate('Sensei', 'web');
        $kenshi = Role::findOrCreate('Kenshi', 'web');

        // Assign permissions
        $pengprovAdmin->syncPermissions([
            'dojo.view',
            'dojo.create',
            'dojo.update',
            'kenshi.view',
            'kenshi.manage',
            'kenshi.export',
            'ukt.view',
            'ukt.evaluate',
            'attendance.view',
        ]);

        $sensei->syncPermissions([
            'dojo.view',
            'kenshi.view',
            'kenshi.manage',
            'attendance.view',
            'attendance.checkin',
            'ukt.view',
        ]);

        $kenshi->syncPermissions([
            'dojo.view',
            'kenshi.view',
            'attendance.view',
            'ukt.view',
        ]);

        // Create Default SuperAdmin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@perkemi.id'],
            [
                'name' => 'Pengurus Besar Perkemi',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($superAdmin);
    }
}
