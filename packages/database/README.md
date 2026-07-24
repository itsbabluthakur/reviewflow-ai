# @reviewflow/database

## Purpose

Drizzle ORM schema, client, migration/seed runners, and repository infrastructure for ReviewFlow AI's PostgreSQL (Supabase) database. Consumed via the `@reviewflow/database` workspace import.

## What belongs here

- The Drizzle schema (`src/schema/`) — table definitions in code.
- The shared database client (`getDb`, `checkDatabaseConnection`) — see [Design notes](#design-notes) for why it's a function, not a plain object.
- Migration and seed **runners** (`src/migrate.ts`, `src/seed.ts`) — the scripts that apply/seed. The generated **SQL** they run lives in [`supabase/migrations`](../../supabase/migrations), not here.
- Repository infrastructure (`src/repository/`) — `BaseRepository`, `withTransaction`, pagination helpers. Generic only; no business repository lives here.

## What should NOT be placed here

- Database migrations themselves (the SQL/DDL) — those live in `supabase/migrations`; this package only holds the ORM schema/client that describes them in code (see [`packages/README.md`](../README.md)).
- Business tables or repositories (`customers`, `reviews`, `businesses`, `locations`, …) — Sprint 3B+. This package currently defines three tables: `users`, `agencies`, `memberships` — see `DATABASE.md` section 2a for exactly which columns are implemented today vs. still aspirational.
- Row Level Security policy SQL — see `supabase/policies`.
- Supabase Auth/Storage/Realtime clients — see `@reviewflow/supabase`.
- Authentication, RBAC/permission checks, or session handling — `memberships.role` is a data column only; enforcing it is out of scope until Sprint 3B+ (ROADMAP.md Phase 1).

## Schema

- **`users`** — platform user profiles (`email` unique, `full_name`, `avatar_url`).
- **`agencies`** — tenant accounts (`name`, `slug` unique, `logo_url`, `timezone`).
- **`memberships`** — joins a user to an agency with a `role` (`owner` | `admin` | `member`); unique on (`agency_id`, `user_id`).

Relations: a user has many memberships, an agency has many memberships, a membership belongs to one user and one agency (`src/schema/*.ts`, via Drizzle's `relations()` — enables `db.query.memberships.findMany({ with: { user: true, agency: true } })`).

## Repositories

`UserRepository`, `AgencyRepository`, and `MembershipRepository` (`src/repository/`) each extend `BaseRepository` and add infrastructure-only finders — no business logic:

```ts
import {
  getDb,
  UserRepository,
  AgencyRepository,
  MembershipRepository,
} from "@reviewflow/database";

const db = getDb();
const users = new UserRepository(db);
const agencies = new AgencyRepository(db);
const memberships = new MembershipRepository(db);

await users.findByEmail("admin@example.com");
await agencies.findBySlug("demo");
await agencies.findMembers(agencyId); // users belonging to the agency
await users.findUserAgencies(userId); // agencies the user belongs to
await memberships.findByAgencyAndUser(agencyId, userId);
```

## Usage

```ts
import {
  getDb,
  checkDatabaseConnection,
  schema,
  BaseRepository,
  withTransaction,
} from "@reviewflow/database";

const db = getDb();
const rows = await db.select().from(schema.users);

// Readiness probes (see apps/web /api/ready):
await checkDatabaseConnection(); // throws DatabaseError if unreachable

// A future domain repository extends BaseRepository rather than
// reimplementing CRUD — see src/repository/user-repository.ts for a
// worked example:
class ExampleRepository extends BaseRepository<typeof schema.users> {
  constructor(db: Database) {
    super(db, schema.users, schema.users.id);
  }
}
```

## Scripts

```bash
pnpm --filter @reviewflow/database db:generate   # Diff schema/ against supabase/migrations, write new SQL
pnpm --filter @reviewflow/database db:migrate    # Apply pending migrations from supabase/migrations
pnpm --filter @reviewflow/database db:seed       # Idempotent seed (safe to re-run)
```

Or from the repo root: `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:seed`.

## Testing

`src/repository/pagination.test.ts` runs unconditionally (no database needed). The repository tests (`src/repository/*-repository.test.ts`) and `src/seed.test.ts` exercise real queries — unique-constraint and relational-query behavior isn't meaningfully mockable — so they're gated on `DATABASE_URL` being set (`hasTestDatabase()` in `src/repository/test-db.ts`) and `describe.skipIf` to a no-op when it isn't, which is why `pnpm test` still passes with no database configured (default CI today has none). Point `DATABASE_URL` at a throwaway Postgres instance to run them for real, e.g.:

```bash
docker run -d -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=reviewflow -p 55432:5432 postgres:16-alpine
export DATABASE_URL=postgresql://postgres:postgres@localhost:55432/reviewflow
pnpm --filter @reviewflow/database run db:migrate
pnpm --filter @reviewflow/database run test
```

These tests share one live database and truncate its tables between tests (`resetTestTables`), so the package's `vitest.config.ts` sets `fileParallelism: false` — running test files concurrently against a shared database would let one file's truncate race another file's inserts.

## Design notes

- **`getDb()` is a function, not a `db` object export.** Next.js evaluates route handler modules (to collect their exports) during `next build` — a plain top-level `const db = postgres(...)` would force `DATABASE_URL` to be set just to build the app. `getDb()` connects lazily, on first real use, and caches the connection on `globalThis` so repeated calls (and Next dev-mode hot reloads) reuse one pool.
- **`DATABASE_URL` validation is local to this package** (`src/env.ts`), not part of `@reviewflow/config`'s shared schema — that schema only validates the variable's _shape_ if present, so apps that don't touch the database aren't blocked from booting without it. This package requires it, lazily, only when something actually asks for a connection.
- **The postgres.js driver** (`postgres` npm package), not `pg` — Drizzle's most-recommended driver for a standard Node runtime; supports both `DATABASE_URL` (direct) and `DATABASE_POOL_URL` (Supabase's pooled/Supavisor connection) from `.env.example`.
