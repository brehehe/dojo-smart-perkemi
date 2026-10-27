# Rule 07: Spatie Ecosystem, Audit Logging & System Diagnostics

## 1. Spatie Role & Permission (`spatie/laravel-permission`)
- **Seeder First**: Define all roles and permissions via dedicated database seeders (`RolesAndPermissionsSeeder.php`).
- **Hierarchy for Perkemi**:
  - `SuperAdmin`: Full system access, audit logs, backup execution, dojo management.
  - `PengprovAdmin`: Regional administrative authority over provincial dojos and UKT schedules.
  - `PengkabAdmin`: City/Regency branch authority over local dojos and member validations.
  - `Sensei`: Dojo head trainer; can manage dojo schedule, submit UKT candidates, check-in attendances.
  - `Kenshi`: Regular member; view profile, digital license, UKT history, and attendance records.
- **Middleware Protection**:
  - Register `role` and `permission` middleware in `bootstrap/app.php`:
    ```php
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ```
- **Blade/Inertia Sharing**: Share authenticated user permissions and roles in `HandleInertiaRequests.php` so UI elements can conditionally render action buttons.

## 2. Spatie Activity Log (`spatie/laravel-activitylog`)
- **Model Auditing**: Add `use LogsActivity` trait to all core domain models (`Dojo`, `Kenshi`, `Attendance`, `Certificate`, `User`).
- **Logging Configuration**:
  ```php
  public function getActivitylogOptions(): LogOptions
  {
      return LogOptions::defaults()
          ->logAll()
          ->logOnlyDirty()
          ->dontLogEmptyChanges()
          ->useLogName('dojo_audit');
  }
  ```
- **Explicit Event Logging**: For critical state changes (e.g. promoting rank, transferring a member to another dojo), write explicit audit entries:
  ```php
  activity('kenshi_promotion')
      ->performedOn($kenshi)
      ->causedBy(auth()->user())
      ->withProperties(['old_rank' => $oldRank, 'new_rank' => $newRank])
      ->log("Kenshi dinaikkan tingkat ke {$newRank->label()}");
  ```

## 3. Spatie Backup (`spatie/laravel-backup`)
- **Daily Automated Backups**: Schedule automated database and media backups via `routes/console.php`:
  ```php
  Schedule::command('backup:clean')->daily()->at('01:00');
  Schedule::command('backup:run')->daily()->at('01:30');
  ```
- **Storage Isolation**: Store production backups on off-site cloud storage (AWS S3, Google Cloud Storage, or MinIO) with strict access policies, never on the local webroot.
- **Notification Channels**: Configure Discord, Slack, or email notifications in `config/backup.php` to immediately alert devops if a backup fails.

## 4. Opcodes Log Viewer (`opcodesio/log-viewer`)
- **Access Gate Protection**: Log Viewer contains internal error details and MUST NOT be publicly accessible.
- Define a strict gate in `app/Providers/AppServiceProvider.php`:
  ```php
  Gate::define('viewLogViewer', function (?User $user) {
      return $user && $user->hasRole('SuperAdmin');
  });
  ```
- Route access: Available at `/log-viewer` exclusively for authorized `SuperAdmin` personnel.
