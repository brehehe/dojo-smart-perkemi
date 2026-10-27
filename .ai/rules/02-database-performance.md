# Rule 02: Database Integrity, Performance & Transactions

## 1. Primary Keys & UUIDs
- Use UUIDv7 or standard UUIDs (`HasUuids` trait) for all public-facing domain models (`Dojo`, `Kenshi`, `Attendance`, `Certificate`) to prevent enumeration attacks (IDOR).
- Foreign keys referencing UUID tables must use `$table->foreignUuid('dojo_id')->constrained()->cascadeOnDelete();`.
- Internal pivot or high-throughput event tables can use unsigned big integers if UUID overhead is detrimental, but consistency across domain boundaries is preferred.

## 2. N+1 Query Prevention & Eager Loading
- **Zero N+1 Tolerance**: Never access Eloquent relationships inside loops or Blade/Inertia transformations without eager loading.
- Always use `with([...])` on queries that render related models:
  ```php
  $kenshis = Kenshi::query()
      ->with(['dojo:id,name,code', 'user:id,name,email'])
      ->withCount('attendances')
      ->latest()
      ->paginate(20);
  ```
- Use `withExists()` and `withCount()` instead of loading collections just to check count or presence.
- Avoid over-fetching: select only the needed columns using `select('id', 'name', 'dojo_id')` or scoped resource transformers.

## 3. Indexing & Query Optimization
- Index every foreign key column in migrations.
- Add composite indices for queries involving multiple filter/sort columns (e.g., `['dojo_id', 'status', 'created_at']`).
- Unique constraints must be enforced at both the database schema level (via migration `$table->unique(...)`) and application level (via FormRequest `Rule::unique`).
- Heavy search queries must leverage full-text indexing or PostgreSQL/MySQL generated search columns rather than raw unindexed `LIKE '%query%'`.

## 4. Database Transactions & Atomicity
- All multi-table write operations (e.g. creating Kenshi + user account + membership invoice + activity log) MUST be wrapped in `DB::transaction(...)`:
  ```php
  DB::transaction(function () use ($dto): Kenshi {
      $user = User::create([...]);
      $kenshi = Kenshi::create([...]);
      activity()->performedOn($kenshi)->log('kenshi_registered');
      return $kenshi;
  });
  ```
- **Automatic Rollback**: Any unhandled Exception inside `DB::transaction()` automatically triggers a rollback. Never catch exceptions inside the transaction unless you explicitly rethrow them or gracefully handle rollback.
- Never execute external non-reversible operations (sending emails, calling payment gateways, dispatching broadcast events) directly inside an open database transaction. Use queue jobs dispatched with `afterCommit()`:
  ```php
  SendWelcomeKenshiEmailJob::dispatch($kenshi)->afterCommit();
  ```

## 5. Soft Deletes Management
- Soft deletes (`use SoftDeletes`) are mandatory for core records (`Dojo`, `Kenshi`, `UKTExam`, `OrganizationUnit`).
- When querying related models that might have soft-deleted parents, explicitly evaluate whether to use `withTrashed()` or `onlyTrashed()`.
- Unique constraints on tables with Soft Deletes must account for `deleted_at`:
  ```php
  Rule::unique('kenshis', 'id_card_number')->whereNull('deleted_at')
  ```
- Provide explicit `restore()` and `forceDelete()` capabilities restricted by authorization policies (`can('forceDelete', $model)`).
