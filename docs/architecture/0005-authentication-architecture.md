# ADR-0005: Authentication architecture — Supabase Auth as identity provider only

**Status:** Accepted
**Date:** 2026-07-25
**Amended:** 2026-07-26 — added Email Normalization and auth_user_id Integrity sections (Sprint 3B refinement pass; no change to the original decisions above).

## Context

Sprint 3A gave the platform its first real domain tables (`users`, `agencies`, `memberships`) but no way for a person to actually sign in. This sprint wires up Supabase Auth and connects it to that existing user model, without building any business feature, dashboard, or RBAC on top. The central risk to design against: conflating "who is this person, per Supabase" with "what business data does this person own, per our own tables" — the two must stay separable, or every future feature ends up coupled to Supabase's user object.

## Decision

### Why Supabase Auth

Per `ARCHITECTURE.md` section 6 and `DECISIONS.md` ADR-0002, Supabase Auth is the already-chosen identity provider — this sprint implements it rather than re-litigating the choice. It owns password hashing, session issuance/refresh, and (later) OAuth — none of which this codebase should reimplement.

### Identity vs. Application User

Supabase's `auth.users` and this application's `public.users` (from Sprint 3A) are deliberately two different things:

- **`AuthIdentity`** (`packages/auth/src/types.ts`) — what Supabase has verified: an id, an email, and whatever profile metadata the identity carries (`full_name`/`avatar_url`, from an OAuth provider or signup options). Ephemeral, per-request — never persisted as-is.
- **`AppUser`** — the `users` row. The source of truth for business data. Can exist before any identity is ever linked to it (e.g. Sprint 3A's seed user), and once linked, an identity's metadata never overwrites an existing application user's fields — see User Synchronization below.

The bridge between them is exactly one nullable, unique, indexed column: `users.auth_user_id` (migration `0003_classy_karma.sql`). Nullable because the application user doesn't require an identity to exist; unique so at most one application user maps to a given identity.

### User Synchronization (`syncUser`)

On every successful authentication, `createAuthService(...).syncUser(identity)` (`packages/auth/src/auth-service.ts`) runs exactly this lookup chain:

1. `findByAuthUserId(identity.id)` — already linked, return as-is.
2. Not found → `findByEmail(identity.email)` — an application user already exists (e.g. seeded, or created by a future invitation flow) but has never signed in: `linkAuthUserId` sets only `auth_user_id`, touching no other column. The existing row's `full_name`/`avatar_url` are never overwritten by the identity's metadata.
3. Neither found → `create` a new application user, populating `email`/`full_name`/`avatar_url` from the identity (falling back to the email itself as `full_name` if the identity carries no name).

It deliberately never creates an agency, membership, or role — that would be conflating identity resolution with tenant onboarding, which stays entirely out of this sprint's scope.

### Email Normalization

`syncUser`'s `findByEmail` step only works as a reliable identity bridge if "the same email" always compares equal, regardless of how it was typed. Postgres's `text` equality is case- and whitespace-sensitive, so `"John@Example.com"`, `" john@example.com "`, and `"JOHN@example.com"` would otherwise be treated as three different users — silently defeating the found-by-email branch and creating duplicate rows for what a person considers the same account.

`normalizeEmail` (`packages/database/src/normalize-email.ts`) is the single canonicalization function — trims whitespace, lowercases, and throws `ValidationError` on an empty result — and every place an email is compared goes through it:

- `UserRepository.findByEmail` (search) and `UserRepository.create` (insert) — so a stored email is always canonical and a search is always canonical, independently of each other.
- `auth-service.ts`'s `syncUser` (synchronization), `signIn`/`signUp` (authentication — normalized before the credential is even sent to Supabase), and `toAuthIdentity` (every identity built from a Supabase user object, covering `getUser()`-derived sessions too).

Normalizing at multiple boundaries (repository, service, identity construction) rather than a single choke point is deliberate: `syncUser` and `findByEmail` are both public methods other code can call directly (as this sprint's own tests do), so each one guards its own invariant instead of trusting every caller to have normalized first. `ValidationError` (422, existing hierarchy) is thrown for an empty value, not `DatabaseError` — it's a bad-input problem, not a database-driver failure. No email format validation was added beyond this — that would be new functionality outside this refinement's scope.

### Repository Factory

`createRepositories(db)` (`packages/database/src/repository/factory.ts`) replaces manual `new UserRepository(db)` construction with one call exposing `{ users, agencies, memberships }`. Each repository is built lazily (a getter, on first property access) over one shared `db` handle. Because `db` is typed `Database | Transaction` (`BaseRepository`'s new `Queryable` type), the same factory works both for ordinary request handling (`getDb()`) and inside `withTransaction` — a future multi-table write (e.g. "create agency + first membership" in one sprint) composes repositories from one factory call instead of duplicating construction logic per transaction.

### Session Lifecycle

- **`getUser()`, never bare `getSession()`, for anything security-relevant.** `getSession()` only decodes the local cookie; `getUser()` round-trips to Supabase Auth to verify the token is still valid. Every session check in this sprint — `auth-service.ts`'s `getValidatedIdentity`, and the middleware's `hasValidSession` — calls `getUser()` first. `getSession()` is only used afterward, to read the non-security-critical `expires_at` field.
- **Middleware never touches the application database.** It only asks Supabase "is there a valid session," via the Edge-safe `@supabase/ssr` client — `packages/auth/src/middleware.ts`'s `resolveMiddlewareDecision` is a pure function of `{ pathname, hasSession }`, with no database dependency at all. This is what "skip database lookup when session missing" means structurally, not just as an optimization: there is no code path in the middleware that can reach `@reviewflow/database`.
- **Middleware fails closed.** If Supabase isn't configured (no `.env.local`, as in this sandbox and in default CI), constructing the server client throws `ConfigurationError`; `apps/web/src/middleware.ts` catches that and treats the request as unauthenticated rather than crashing or — worse — letting it through. Verified: `pnpm build && pnpm start` with no Supabase env vars set still redirects `/dashboard` to `/login` correctly (see this sprint's Playwright suite, `tests/e2e/auth-middleware.spec.ts`).
- **Page routes vs. API routes get different denials.** An unauthenticated request to a protected _page_ (`/dashboard`, `/settings`, `/account`) gets a 307 redirect to `/login?redirect=<original path>`; an unauthenticated request to a protected _API_ route (`/api/private/*`) gets the standard `API.md` JSON error envelope (401, `AUTHENTICATION_ERROR`) directly from the middleware, not an HTML redirect — a `fetch()` caller has no use for a `Location` header. This was caught empirically during this sprint's manual verification (the first implementation redirected API calls too) before it reached the deliverable.
- **No redirect loops, by construction.** Only paths matching `PROTECTED_PREFIXES` (`/dashboard`, `/settings`, `/account`, `/api/private`) ever produce a "redirect" or "deny" decision; `/login` (and every other `PUBLIC_PATHS` entry) always resolves to "allow", so nothing can redirect into another redirect.
- **Session helpers never expose the raw Supabase session.** `AppSession` carries only `{ identity: { id, email, fullName?, avatarUrl? }, expiresAt }` — no access/refresh token ever leaves `auth-service.ts`, per `SECURITY.md` sections 12 and 17.
- **`requireMembership`** (`packages/auth/src/session.ts`) is the sprint's tenant-context check: authenticated → application user exists (guaranteed by `requireUser`'s `syncUser` call) → membership row exists for the target agency → allow. It deliberately does not inspect `membership.role` — see Future RBAC below.

### Service-role Supabase client: not used

Every auth flow in this sprint (`signUp`, `signIn`, `signOut`, `refreshSession`, `getUser`) uses the anon-key browser/server client (`createServerSupabaseClient`, already provided by `@reviewflow/supabase`). The service-role/admin client (`createAdminSupabaseClient`) was considered and deliberately **not** used anywhere in this sprint: nothing here needs to bypass Row Level Security or act outside a user's own session. Admin-initiated user management (e.g. an invite flow that creates a Supabase identity server-side without the invitee ever calling `signUp`) would be a legitimate future reason to reach for it, but that's team/invitation functionality, explicitly out of this sprint's scope.

### `auth_user_id` integrity: a logical reference, not a foreign key

**Decision: no `REFERENCES auth.users(id)` constraint was added.** `users.auth_user_id` remains a plain, nullable, unique, indexed `uuid` column — the relationship to Supabase's identity is enforced entirely in application code (`syncUser`), not by Postgres.

This was investigated concretely, not assumed. `auth.users` lives in Postgres's `auth` schema, which Supabase's hosted platform provisions alongside `public` in the _same_ database — so a same-database FK is structurally possible in principle. But:

- **This project's own migration pipeline can't safely express it.** `packages/database`'s Drizzle schema (`src/schema/`) is the sole source of truth `drizzle-kit generate` diffs against (ADR-0002), and it intentionally contains only tables this application owns. Adding a `pgTable` mirror of `auth.users` to reference from `users.authUserId` would make Drizzle believe _we_ own that table's DDL — risking a future unrelated `db:generate` emitting `ALTER`/`DROP` statements against Supabase's internally-managed auth schema, which we must never touch.
- **It breaks local/CI parity, confirmed empirically.** This sprint's own validation database (a plain `postgres:16-alpine` container, the same one every migration in this project has been verified against) has no `auth` schema at all:
  ```
  $ psql -c "\dn"
    Name  |       Owner
  --------+-------------------
   public | pg_database_owner

  $ psql -c "ALTER TABLE public.users ADD CONSTRAINT test_fk FOREIGN KEY (auth_user_id) REFERENCES auth.users(id);"
  ERROR:  schema "auth" does not exist
  ```
  A hard FK would make `pnpm db:migrate` fail in exactly the environment this project uses for local development and (per `docs/architecture/0002-database-and-migrations.md`) its own migration verification, unless every contributor and CI runner provisions the full Supabase stack (`supabase start`) just to run migrations — a much heavier operational requirement than this column change justifies.
- **Supabase's own guidance is consistent with this.** Supabase explicitly documents `auth.users` as a platform-managed table and recommends application tables reference it by convention (typically via a `public.profiles`-style table, which `users` already is) rather than a hard FK, precisely because `auth.*` schema migrations are owned and versioned by the Supabase platform/CLI, independently of application migrations.
- **The operational trade-off is already covered.** A hard FK's main benefit — preventing an orphaned `auth_user_id` after a Supabase-side user deletion — isn't needed here: `syncUser`'s `findByAuthUserId` → `findByEmail` → `create` chain already tolerates an `auth_user_id` that no longer resolves to a live identity (the next sign-in simply re-links or re-creates); nothing in this codebase joins across the schema boundary and assumes referential integrity. Enforcement is one `UNIQUE` constraint (already present) plus this application-layer chain — sufficient for what `auth_user_id` is actually used for today.

If a future sprint's requirements change this calculus (e.g. a hard requirement to cascade-delete application data when a Supabase identity is deleted), the right tool is a Supabase Auth webhook or Postgres trigger reacting to `auth.users` deletions and calling into application code — not a cross-schema FK from our own migration pipeline.

### Future RBAC

`membership.role` (`owner` | `admin` | `member`, from Sprint 3A) is stored but not yet enforced anywhere. `requireMembership` proves _a_ membership exists, not that its role permits the specific action being taken. A future sprint adds permission checks on top of the same membership row — extending `requireMembership` (or a new `requirePermission`/`requireRole` built on it) rather than replacing it, consistent with `ARCHITECTURE.md` section 7's Super Admin / Agency Owner / Agency Staff / Business Owner / Manager / Employee model.

## Consequences

- Every future protected Route Handler composes `withApiContext(withUser(handler))` or `withApiContext(withMembership(getAgencyId, handler))` (`apps/web/src/lib/api-auth.ts`) — auth failures propagate as `AuthenticationError`/`AuthorizationError` and are converted to the standard envelope by the one place that already does that (`withApiContext`), so there's no duplicate error-to-response logic to keep in sync.
- Adding a business feature that needs "does this agency have a `businesses` table yet" or similar is unaffected by this sprint — `syncUser` and `requireMembership` only ever reason about `users`/`agencies`/`memberships`.
- RLS is still not enabled on any table (`supabase/policies` remains empty) — see this sprint's Technical Debt section in the deliverables report. `requireMembership` is today's _only_ tenant-isolation enforcement, at the application layer; it is not a substitute for RLS, which `SECURITY.md` section 6 still mandates before this goes to production.
- A future sprint building the actual `/login` page reads the `redirect` query param this middleware already attaches and redirects back after a successful `signIn` — the middleware and `AuthService` are ready for that; building the page itself was out of this sprint's scope.
- A future email-update feature (a user changing their own email) must normalize through `normalizeEmail` too, at whatever new call site introduces it — `UserRepository` doesn't currently expose an "update email" method, so there's nothing to retrofit yet.
- `auth_user_id`'s referential integrity is a documented application-layer invariant (`syncUser`), not a database-enforced one. Revisit this decision if a future requirement (e.g. cascading deletes on identity removal) changes the trade-off described above.
