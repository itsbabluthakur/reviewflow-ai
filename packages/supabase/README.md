# @reviewflow/supabase

## Purpose

Factory functions for the three Supabase client contexts ReviewFlow AI needs — browser, server, and admin — for use by `apps/web`. Consumed via the `@reviewflow/supabase` workspace import.

## What belongs here

- `createBrowserSupabaseClient` — Client Components, uses the public anon key.
- `createServerSupabaseClient` — Server Components / Route Handlers / Server Actions, uses the anon key plus a caller-supplied cookie adapter to read/refresh the session.
- `createAdminSupabaseClient` — service-role key, bypasses Row Level Security, guarded to throw if called in a browser context.

## What should NOT be placed here

- Auth flows (login, logout, session middleware) — this package only builds clients; Sprint 2+ implements auth on top of them.
- The Drizzle ORM layer for direct Postgres access — see `@reviewflow/database`. This package is specifically the Supabase platform SDK (Auth/Storage/Realtime surface), not the query layer.
- Next.js-specific code (`next/headers`, middleware) — this package is framework-agnostic by design. `createServerSupabaseClient` takes a generic `CookieAdapter`; the Next.js adapter lives in `apps/web/src/lib/supabase.ts`.

## Usage

```ts
import {
  createBrowserSupabaseClient,
  createServerSupabaseClient,
  createAdminSupabaseClient,
} from "@reviewflow/supabase";

// Client Component
const supabase = createBrowserSupabaseClient();

// Server Component / Route Handler (Next.js adapter shown, see apps/web/src/lib/supabase.ts)
const supabase = createServerSupabaseClient({
  getAll: () => cookieStore.getAll(),
  setAll: (cookies) =>
    cookies.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
});

// Trusted backend code only — never in a client bundle
const admin = createAdminSupabaseClient();
```

## Design notes

- No client here is parameterized with a generated `Database` type yet — there are no tables (this sprint's scope explicitly excludes them). Once Sprint 2+ adds real tables, generate types with the Supabase CLI and parameterize each `createClient`/`createBrowserClient`/`createServerClient` call with `<Database>`.
- The service-role key is validated by its own schema inside `createAdminSupabaseClient`, not the shared `loadSupabaseEnv` — so simply importing this package, or creating a browser/server client, never reads or requires that credential.
