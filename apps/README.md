# apps/

## Purpose

Deployable applications. Each subdirectory is an independently runnable, independently deployable unit — something with its own entry point, build output, and deployment target.

## Responsibilities

* Compose UI, routing, and server endpoints out of shared `packages/*` building blocks.
* Own environment-specific configuration (via `.env.local`, deployment platform settings).
* Own the top-level build/start scripts consumed by Turborepo (`dev`, `build`, `lint`, `typecheck`, `test`).

## Structure

```text
apps/
  web/    # Primary Next.js application (customer + agency dashboard)
```

Future applications (for example a dedicated marketing site, an admin console, or a mobile app shell) are added as sibling directories here, not nested inside `web/`.

## What belongs here

* Next.js (or other framework) app directories with their own `package.json`.
* App-specific pages, layouts, route handlers, and app-level middleware.
* App-specific configuration that cannot be shared (e.g. `next.config.ts`).

## What should NOT be placed here

* Reusable UI components, hooks, or business logic — those belong in `packages/*` so multiple apps can share them.
* Database schema, migrations, or RLS policies — those belong in `supabase/`.
* Standalone scripts unrelated to a specific app's build/runtime — those belong in `scripts/`.

See the root [`ARCHITECTURE.md`](../ARCHITECTURE.md) for how apps relate to the rest of the monorepo.
