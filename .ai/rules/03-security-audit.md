# Rule 03: Security Audit, Authorization & Production Hardening

## 1. Authentication & Authorization (Spatie Permissions)
- Use `spatie/laravel-permission` for role-based access control (RBAC):
  - Roles: `SuperAdmin`, `PengprovAdmin`, `PengkabAdmin`, `Sensei` (Dojo Head), `Kenshi` (Member).
  - Explicit granular permissions: `dojo.view`, `dojo.create`, `dojo.update`, `dojo.delete`, `kenshi.manage`, `ukt.evaluate`.
- **Policy Enforcement**: Every Controller action modifying or reading sensitive models must invoke a dedicated Policy:
  ```php
  $this->authorize('update', $dojo);
  ```
- **IDOR & Scope Isolation**: Never allow users to query records across Dojo boundaries unless they hold global administrative roles. Always scope queries to the authenticated user's assigned Dojo:
  ```php
  $query = Kenshi::query();
  if (! $user->hasRole('SuperAdmin')) {
      $query->where('dojo_id', $user->dojo_id);
  }
  ```

## 2. Mass Assignment & Data Sanitation
- Explicitly guard models using `#[Fillable([...])]` or `protected $fillable = [...]`.
- Never use `protected $guarded = []`.
- Never pass `$request->all()` into `Model::create()` or `Model::update()`. Always use `$request->validated()` from dedicated Form Requests.

## 3. SQL Injection, XSS & CSRF Prevention
- Never write raw unparameterized SQL strings (`DB::raw("name = '$input'")` is strictly forbidden). Always pass binding arrays: `DB::raw('name = ?', [$input])`.
- In Inertia/React, all user output is sanitized by default. When using raw HTML rendering (`dangerouslySetInnerHTML`), sanitize inputs using a certified DOMPurify utility.
- Ensure Laravel CSRF tokens are injected and verified on all mutating state routes (`POST`, `PUT`, `PATCH`, `DELETE`).

## 4. File Upload Hardening
- File uploads (Kenshi profile photos, certificate scans, identity cards) must enforce strict validations:
  - Whitelist mimes: `['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120']`.
  - Store files on private disks with signed URLs if they contain personal identifiable information (PII).
  - Never trust the client-provided file extension: generate randomized UUID file names on storage: `$request->file('avatar')->storeAs('avatars', Str::uuid() . '.' . $extension, 'private')`.

## 5. Rate Limiting & Sensitive Endpoints
- Apply rate limiting to all authentication endpoints (Login: 5 attempts per minute, Password Reset: 3 attempts per minute).
- Restrict sensitive actions (UKT certificate generation, data export) with throttle middleware:
  ```php
  Route::middleware(['throttle:exports'])->group(...);
  ```

## 6. Information Leakage & Error Responses
- In production, `APP_DEBUG=false` is non-negotiable.
- Under no circumstance should SQL query strings, database connection credentials, or PHP stack traces be returned to the client in HTTP responses.
- In `bootstrap/app.php`, configure exception rendering to return clean user-facing error messages while recording the complete trace into secure server logs:
  ```php
  ->withExceptions(function (Exceptions $exceptions): void {
      $exceptions->render(function (Throwable $e, Request $request) {
          if ($request->expectsJson() && !app()->environment('local')) {
              return response()->json([
                  'message' => 'Terjadi kesalahan sistem. Silakan hubungi pengurus Perkemi.',
              ], 500);
          }
      });
  })
  ```
