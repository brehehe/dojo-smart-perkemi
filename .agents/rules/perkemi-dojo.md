# Perkemi e-Dojo Master AI Rules & Engineering Standards

This document establishes the authoritative rules for all AI agents working on the Perkemi e-Dojo platform.

## 1. Core Architecture & Refactoring
- **Never Rewrite Wholesale**: Audit first, establish an incremental plan, test, then refactor step by step. Preserve existing routes, features, and database integrity.
- **Thin Controllers**: Controllers must never contain raw database queries, business transactions, or heavy validations. Delegate directly to Form Requests, Actions (`app/Actions/**`), and Policies.
- **Strict Typing**: PHP 8.4+ constructor promotion, explicit parameter types, and method return types everywhere.
- **Transactions & Rollback**: Wrap all multi-step mutations in `DB::transaction()`. Never catch an exception without re-throwing or explicitly handling rollback. Ensure partial data is never committed.

## 2. Database & High Performance
- **UUIDs Everywhere**: Use UUIDv7 or `HasUuids` on all primary keys and foreign keys for public-facing models.
- **Zero N+1 Queries**: Always use eager loading (`with([...])`), `withCount()`, and `withExists()`. Never loop through models and query relationships lazily.
- **Soft Deletes**: Apply `SoftDeletes` on core models (`Dojo`, `Kenshi`, `Attendance`). Provide controlled restore and force-delete capabilities governed by policies.
- **Non-Destructive Migrations**: Never modify existing migrations that have run in production. Always write incremental migrations.

## 3. Frontend Aesthetics & Anti-AI Slop
- **Brand Identity**: Shorinji Kempo Perkemi — Japanese martial arts heritage blended with Indonesian athletic authority.
  - Kurogane Navy (`#0B132B`, `#1C2541`)
  - Shushu Vermilion (`#DC2626`)
  - Dojo Gold (`#D97706`)
  - Clean whites, precise borders (`#E2E8F0`), high contrast text (`#0F172A`).
- **Strict Anti-Slop Prohibitions**:
  - NO emojis as UI icons (strictly use `lucide-react` SVGs).
  - NO generic warm cream (`#F4F1EA`) + terracotta (`#D97757`).
  - NO neon cyber themes or pitch black with acid green.
  - NO identical rounded cards with soft blurry shadows everywhere.
  - NO layout-shifting transforms on hover (scale 1.05 is banned). Use smooth color and border transitions.
  - NO unprompted scrolling fade-and-slide animations on every section.
- **UI Component Library**: React + TypeScript + Inertia.js + Tailwind CSS + Framer Motion, following the complete Tailwind Plus UI Blocks categories.

## 4. Security, Diagnostics & Spatie Ecosystem
- **Spatie Role & Permission**: Enforce granular permissions (`dojo.view`, `dojo.create`, `kenshi.manage`) via Policies on every action.
- **Activity Log**: Audit all model updates using `spatie/laravel-activitylog`.
- **Spatie Backup**: Automated daily off-site backups with failure alerts.
- **Log Viewer**: Secure `/log-viewer` behind `SuperAdmin` gate.
- **Zero Information Leakage**: `APP_DEBUG=false` in production. Never leak stack traces, SQL strings, or credentials to end users.
