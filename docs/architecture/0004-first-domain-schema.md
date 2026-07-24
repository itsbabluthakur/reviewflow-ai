# ADR-0004: First domain schema (users, agencies, memberships) and its repositories

**Status:** Accepted
**Date:** 2026-07-24

## Context

Sprint 2 (ADR-0002) proved the migration/seed pipeline end-to-end with one internal-only table, `_infra_probe`, explicitly meant to be discarded once real tables existed. This sprint adds the platform's first real domain tables — scoped deliberately narrow: enough to represent "a user belongs to an agency with a role," nothing about authentication, RBAC enforcement, or the fuller multi-tenant hierarchy (`businesses`, `locations`, …) `DATABASE.md` describes as the eventual target.

## Decision

- **Three tables, minimal columns:** `users` (`email` unique, `full_name`, `avatar_url`), `agencies` (`name`, `slug` unique, `logo_url`, `timezone`), `memberships` (`agency_id` FK, `user_id` FK, `role`, unique on the FK pair). Every table has `id`/`created_at` per `CLAUDE.md`'s Database Standards; `updated_at` is added to `users`/`agencies` (mutable entities) but not `memberships` (an immutable join row — role changes would be a future feature, not implemented here).
- **`role` is a Postgres enum (`owner` | `admin` | `member`), not the full RBAC/permission-catalog model** (`roles`, `permissions`, `user_roles` in `DATABASE.md` sections 3–4). This sprint stores a role label; it does not enforce anything with it. Full RBAC is explicitly out of scope until authentication lands (`ROADMAP.md` Phase 1).
- **`_infra_probe` is removed**, generated as its own migration (`0001_fuzzy_thunderbird.sql`, a bare `DROP TABLE`) before the new tables' migration (`0002_fixed_gertrude_yorkes.sql`). Generating both changes in a single `drizzle-kit generate` pass makes the tool ask (interactively, via a TTY-only prompt) whether the dropped table was "renamed" to one of the new ones — splitting the drop into its own empty-schema generation pass first sidesteps that ambiguity entirely, and keeps the migration history honest (a drop, not a disguised rename).
- **Each table's repository (`UserRepository`, `AgencyRepository`, `MembershipRepository`) extends `BaseRepository`** per `ARCHITECTURE.md` section 4, adding exactly one distinctive finder apiece (`findByEmail`, `findBySlug`, `findByAgencyAndUser`) plus one relational convenience method each (`findUserAgencies`, `findMembers`) built on Drizzle's relational query API (`db.query.memberships.findMany({ with: {...} })}`), which the schema's `relations()` definitions (`src/schema/*.ts`) enable. No business logic (permission checks, cross-tenant rules) lives in these repositories — infrastructure only.
- **Repository/seed tests require a real Postgres database and are gated on `DATABASE_URL`.** Unique-constraint violations and relational joins aren't meaningfully mockable, but requiring a database unconditionally would break `pnpm test` in the default CI environment (no Postgres service provisioned). `describe.skipIf(!hasTestDatabase())` (`src/repository/test-db.ts`) makes them a no-op when unset and real integration tests when a database is available — verified both ways as part of this sprint (7 tests run / 10 skip without `DATABASE_URL`; all 17 pass against a live container with it set).
- **`packages/database`'s `vitest.config.ts` sets `fileParallelism: false`.** These tests share one live database and truncate its tables between tests; running test files in parallel (Vitest's default) caused real cross-file races (one file's `TRUNCATE` deleting rows another file's test had just inserted) — reproduced and fixed during this sprint's validation, not a theoretical concern.

## Consequences

- Adding the next real table (e.g. `businesses`) is an ordinary additive migration — no more drop/rename ambiguity to work around, since `_infra_probe` is gone.
- `DATABASE.md` section 2a documents the gap between what's implemented today (three minimal tables) and the fuller schema the rest of that document describes as the target — the intent is additive migrations closing that gap over time, not a rewrite.
- A future auth sprint that adds `auth_user_id` to `users` or a permission catalog for `memberships.role` extends these tables rather than replacing them.
- Contributors running `pnpm test` locally without a database configured see the new repository/seed suites skip, not fail — consistent with how `drizzle.config.ts` already treats a missing `DATABASE_URL` as normal outside commands that truly need a connection.
