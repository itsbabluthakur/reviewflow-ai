# packages/

## Purpose

Shared, framework-agnostic code consumed by one or more apps in `apps/`. Anything used in more than one place — or that benefits from being tested and versioned in isolation — lives here instead of inside an app.

## Responsibilities

Each package should do one thing, expose a small typed public API (via `src/index.ts`), and have no knowledge of which app consumes it.

## Structure

```text
packages/
  ui/           # Shared design-system components (buttons, forms, tables, etc.)
  auth/         # Auth helpers: session handling, tenant/permission checks
  database/     # Drizzle schema, client, and repository/query helpers
  validation/   # Shared Zod (or equivalent) schemas for forms and API payloads
  config/       # Shared runtime configuration and environment parsing
  types/        # Shared TypeScript types/interfaces used across apps and packages
  utils/        # Small framework-agnostic utility functions
  emails/       # Transactional email templates (React Email or equivalent)
```

## What belongs here

- Code with no app-specific routing, layout, or deployment concerns.
- Code that is (or will be) used by more than one app, or is cleanly testable on its own.
- Package-local types, tests, and a `package.json` scoped to that package.

## What should NOT be placed here

- Pages, routes, or anything tied to a specific app's URL structure — those belong in `apps/`.
- Database migrations themselves (SQL/DDL) — those live in `supabase/migrations`; `packages/database` only holds the ORM schema/client that describes them in code.
- One-off scripts — those belong in `scripts/`.

See [`ARCHITECTURE.md`](../ARCHITECTURE.md) section 3 (Monorepo Structure) and section 4 (Application Layers) for how these packages map onto the layered architecture.
