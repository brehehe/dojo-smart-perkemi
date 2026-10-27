# AI Rules Index - Perkemi e-Dojo

This index maps application file globs to specific architectural, security, database, and design guidelines. All AI agents and developers must strictly adhere to these rules before planning, creating, or modifying code.

| Glob / Path | Rule File | Description |
|---|---|---|
| `app/Http/Controllers/**`, `app/Actions/**`, `app/Services/**` | [.ai/rules/01-laravel-architecture.md](file:///.ai/rules/01-laravel-architecture.md) | Thin controllers, Action/Service layer, DTOs, Enums, FormRequests |
| `database/**`, `app/Models/**` | [.ai/rules/02-database-performance.md](file:///.ai/rules/02-database-performance.md) | UUIDs, N+1 query prevention, indexing, transactions, SoftDeletes |
| `app/Policies/**`, `config/permission.php`, `app/Http/Middleware/**` | [.ai/rules/03-security-audit.md](file:///.ai/rules/03-security-audit.md) | Spatie permission, authorization, SQLi, XSS, CSRF, IDOR |
| `app/Jobs/**`, `app/Events/**`, `config/queue.php`, `config/reverb.php` | [.ai/rules/04-queue-redis-reverb.md](file:///.ai/rules/04-queue-redis-reverb.md) | Redis cache, Queue worker reliability, after-commit jobs, Reverb WS |
| `resources/css/**`, `resources/js/**` | [.ai/rules/05-perkemi-design-system.md](file:///.ai/rules/05-perkemi-design-system.md) | Anti-AI Slop, Perkemi martial arts identity, typography, a11y |
| `resources/js/Components/**` | [.ai/rules/06-tailwind-plus-component-library.md](file:///.ai/rules/06-tailwind-plus-component-library.md) | Tailwind Plus UI Blocks component library, typing, props, accessibility |
| `config/backup.php`, `config/activitylog.php`, `config/log-viewer.php` | [.ai/rules/07-spatie-ecosystem.md](file:///.ai/rules/07-spatie-ecosystem.md) | Spatie Permission, ActivityLog, Spatie Backup, Opcodes Log Viewer |
