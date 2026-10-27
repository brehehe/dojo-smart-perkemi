# Perkemi e-Dojo: AI Engineering & Design Rules

Welcome to the **Perkemi e-Dojo** (Persaudaraan Bela Diri Kempo Indonesia) engineering standard. This document compiles our strict production readiness rules, backend architecture, frontend design guidelines, and Spatie ecosystem integration.

---

## Table of Contents
1. [Architecture & Code Quality (Thin Controllers & Actions)](#1-architecture--code-quality)
2. [Database Integrity, Performance & N+1 Prevention](#2-database-integrity--performance)
3. [Transactions & Error Handling](#3-transactions--error-handling)
4. [Redis, Queue & Background Jobs](#4-redis-queue--background-jobs)
5. [Laravel Reverb & Real-Time Broadcasting](#5-laravel-reverb--real-time)
6. [Security Audit & Vulnerability Hardening](#6-security-audit--hardening)
7. [Environment & Production Readiness](#7-environment--production-readiness)
8. [Testing & Verification Standards](#8-testing--verification)
9. [Perkemi e-Dojo Design System & Anti-AI Slop Guide](#9-perkemi-design-system--anti-ai-slop)
10. [Tailwind Plus UI Components Library](#10-tailwind-plus-ui-components-library)
11. [Spatie Ecosystem (Permissions, Activity Log, Backup, Log Viewer)](#11-spatie-ecosystem)

---

## 1. Architecture & Code Quality
- **Thin Controllers**: Controllers must never contain raw database queries, business transactions, or heavy validations. Delegate directly to Form Requests, Actions (`app/Actions/**`), and Policies.
- **Directory Structure**:
  - `app/Actions/{Domain}/` - Single-purpose action classes (`CreateDojoAction`, `RegisterKenshiAction`).
  - `app/Http/Requests/{Domain}/` - Dedicated Form Requests with array-based validation rules.
  - `app/Http/Resources/` - Inertia / API JSON transformers.
  - `app/Policies/` - Model authorization tied to Spatie permissions.
  - `app/Enums/` - Strict PHP 8 Enums for domain states (`KenshiRank`, `DojoStatus`).
- **PHP 8.4 Conventions**: Mandatory constructor property promotion, strict parameter typing, and return type declarations on all methods.

---

## 2. Database Integrity & Performance
- **Primary Keys**: Use UUIDv7 or `HasUuids` on all public-facing models (`Dojo`, `Kenshi`, `Attendance`, `Certificate`) to prevent enumeration attacks (IDOR).
- **Zero N+1 Tolerance**:
  - Always eager-load relations with `with(['relation:id,name'])`.
  - Use `withCount()` and `withExists()` instead of loading collections just to check size.
- **Indexing**: Add composite indexes on multi-column filters (e.g. `['dojo_id', 'status', 'created_at']`).
- **Soft Deletes**: Apply `SoftDeletes` on core records. Provide controlled `restore()` and `forceDelete()` actions protected by policies.
- **Non-Destructive Migrations**: Never modify existing migrations that have run in production. Always write new incremental migrations.

---

## 3. Transactions & Error Handling
- Wrap multi-table write operations in `DB::transaction()`.
- Automatic rollback on unhandled exceptions; never catch exceptions without re-throwing or explicitly executing rollback.
- Never dispatch non-reversible external actions (payment gateways, emails, SMS) directly inside an open transaction. Use queue jobs with `afterCommit()`.
- Never show SQL errors, stack traces, or credentials to end users (`APP_DEBUG=false` in production).

---

## 4. Redis, Queue & Background Jobs
- Use Redis for Cache, Queue, and Session drivers in production.
- All queued jobs must be idempotent with explicit `$tries`, `$timeout`, and `$backoff`.
- Implement `failed(?Throwable $exception)` hooks to log failures and notify administrators.

---

## 5. Laravel Reverb & Real-Time
- Broadcast only on authorized private or presence channels (`Broadcast::channel(...)`).
- Restrict Reverb allowed origins in `config/reverb.php`.
- Reverse proxy Reverb behind Nginx with TLS termination (WSS).
- Graceful degradation: The application must remain fully functional if WebSockets are unavailable.

---

## 6. Security Audit & Hardening
- Strictly guard models using `#[Fillable([...])]` or `protected $fillable = [...]`. Never use `$guarded = []`.
- Validate all input via Form Requests; never pass `$request->all()` into model mutations.
- File upload protection: Whitelist MIME types, enforce max file sizes, and store with randomized UUID names on private disks.
- Rate limit authentication, registration, password resets, and heavy data exports.

---

## 7. Environment & Production Readiness
- Keep `.env.example` in sync with all required environment keys. Never commit secret credentials to Git.
- Configure Supervisor / systemd to supervise queue workers and Reverb.
- Use Docker / Nginx configurations with strict security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options).

---

## 8. Testing & Verification
- Feature tests (`tests/Feature/**`) covering CRUD, authorization, validation, UUIDs, soft deletes, and rollbacks.
- Unit tests (`tests/Unit/**`) for pure business actions and calculation logic.
- Run tests with `php artisan test --compact` or `vendor/bin/phpunit`. Run `vendor/bin/pint --format agent` to format code before committing.

---

## 9. Perkemi Design System & Anti-AI Slop
- **Subject Matter**: Shorinji Kempo Perkemi — Japanese martial arts heritage, Indonesian sports federation prestige, physical discipline, and athletic precision.
- **Color Palette**:
  - `Primary Navy`: `#0B132B` (deep dark surface/header), `#1C2541` (secondary dark surface)
  - `Kempo Vermilion`: `#DC2626` (primary brand accent, action badges, danger)
  - `Dojo Gold`: `#D97706` (Dan ranks, honors, highlights)
  - `Neutral Light`: `#F8FAFC` (page background), `#FFFFFF` (card surfaces)
  - `Borders`: `#E2E8F0` (light mode), `#334155` (dark mode)
  - `Text`: `#0F172A` (high-contrast primary), `#475569` (secondary)
- **Anti-Slop Prohibitions**:
  - NO emojis as icons (strictly SVG via `lucide-react`).
  - NO generic warm cream (`#F4F1EA`) + terracotta (`#D97757`).
  - NO cyber acid-green on pitch black.
  - NO identical rounded cards with soft blurry shadows everywhere.
  - NO layout-shifting transforms on hover (`scale(1.05)` is forbidden).
  - NO decorative all-caps labels or arbitrary numbered markers (01, 02) on non-sequential content.

---

## 10. Tailwind Plus UI Components Library
Built with React + TypeScript + Inertia.js + Tailwind CSS + Framer Motion across all 10 categories:
- **Elements**: `Button`, `Badge`, `Avatar`, `Dropdown`, `ButtonGroup`.
- **Forms**: `Input`, `Select`, `Combobox`, `Checkbox`, `Radio`, `Toggle`, `Textarea`, `FormGroup`.
- **Navigation**: `Navbar`, `Sidebar`, `Tabs`, `Breadcrumb`, `Pagination`, `CommandPalette`.
- **Data Display**: `Table`, `DescriptionList`, `StatsCard`, `EmptyState`, `RankBadge`.
- **Feedback**: `Alert`, `Notification/Toast`, `LoadingSpinner`.
- **Overlays**: `Modal`, `ConfirmDialog`, `Drawer`, `Popover`.
- **Layout**: `Container`, `Card`, `Divider`, `SectionHeading`, `PageHeading`.
- **Marketing**: `Hero`, `Features`, `Pricing`, `Testimonials`, `FAQ`, `CTA`, `Footer`.
- **Ecommerce/Store**: `ProductCard`, `ProductList`, `Cart`, `Checkout`, `OrderSummary`.

---

## 11. Spatie Ecosystem
- **Role & Permission**: Granular roles (`SuperAdmin`, `PengprovAdmin`, `PengkabAdmin`, `Sensei`, `Kenshi`) and permissions enforced via Policies.
- **Activity Log**: Automatically audit model changes (`LogsActivity`) and log explicit domain events (`activity()->log(...)`).
- **Spatie Backup**: Scheduled daily automated backups to off-site cloud storage.
- **Opcodes Log Viewer**: Accessible at `/log-viewer` exclusively for `SuperAdmin` via authorization gate.
