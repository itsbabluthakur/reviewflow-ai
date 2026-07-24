# ADR-0002: Database client, ORM driver, and migration ownership

**Status:** Accepted
**Date:** 2026-07-24

## Context

This sprint builds the platform's first real connection to Postgres/Supabase. Three things needed deciding: which Drizzle driver to use, where migration SQL physically lives, and how `packages/database` relates to `packages/supabase` (the Supabase platform SDK) — both talk to the same database, but for different reasons.

## Decision

- **Driver:** `drizzle-orm/postgres-js` (the `postgres` npm package) — Drizzle's most-recommended driver for a standard Node runtime, and it supports both `DATABASE_URL` (direct) and `DATABASE_POOL_URL` (Supabase's pooled/Supavisor connection), both already reserved in `.env.example`.
- **Migration SQL lives in `supabase/migrations`, not `packages/database`.** This was already decided in `packages/README.md` before this sprint ("Database migrations themselves … live in `supabase/migrations`; `packages/database` only holds the ORM schema/client that describes them in code") — `drizzle.config.ts`'s `out` points there, so `pnpm db:generate` writes SQL to the same place the Supabase CLI would.
- **The database client is a lazy singleton (`getDb()`), not an eager module-level export.** Next.js evaluates Route Handler modules to collect their exports during `next build` — a top-level `const db = postgres(DATABASE_URL)` would make `DATABASE_URL` mandatory just to run `next build`, which broke the build the first time it was tried (see this sprint's validation log). `getDb()`/`checkDatabaseConnection()` connect only when actually called, and cache the connection on `globalThis` afterward.
- **`packages/supabase` is a separate package from `packages/database`**, not a merged concern. `packages/database` (Drizzle) is the direct-Postgres query layer for our own schema; `packages/supabase` (`@supabase/supabase-js` + `@supabase/ssr`) is the Supabase _platform_ SDK surface — Auth, Storage, Realtime — none of which this sprint implements, but the client factories exist so Sprint 2+ auth work has somewhere to start.
- **Exactly one table exists:** `_infra_probe`, with no business meaning, whose only purpose is proving the migrate/seed pipeline works. It was generated, migrated, and seeded (idempotently — verified by running the seed script twice) against a real Postgres container as part of this sprint's validation, not left unverified.

## Consequences

- Adding a real table later is `pnpm db:generate` (writes SQL to `supabase/migrations`) → review the SQL → `pnpm db:migrate`. Same workflow regardless of whether the schema change originated in Drizzle or a hand-written migration.
- `DATABASE_URL` is validated by `packages/database`'s own schema (`src/env.ts`, via `@reviewflow/config`'s shared `parseEnv` helper), not the global `loadEnv()` schema — so `apps/web` boots fine without a database configured, and only fails (with a clear `ConfigurationError`) when something actually tries to query.
- A future domain repository extends `BaseRepository` (`packages/database/src/repository`) instead of hand-writing CRUD per table; `withTransaction` and the pagination helpers are similarly meant to be reused, not reimplemented per feature.
