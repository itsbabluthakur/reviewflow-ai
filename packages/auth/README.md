# @reviewflow/auth

## Purpose

Framework-independent authentication/session layer bridging Supabase Auth (the identity provider) to ReviewFlow AI's application `users` table (the source of truth for business data). Consumed via the `@reviewflow/auth` workspace import. See [ADR-0005](../../docs/architecture/0005-authentication-architecture.md) for the full design rationale.

## What belongs here

- `src/auth-service.ts` — `createAuthService`: `signUp` / `signIn` / `signOut` / `refreshSession` / `getCurrentSession` / `getCurrentUser` / `syncUser` / `requestPasswordReset`. Wraps every Supabase response into this package's own types (`AppUser`, `AppSession`, `AuthResult`) — never returns a raw Supabase session or user object.
- `src/session.ts` — read-only guards for Server Components/Route Handlers: `requireSession` / `optionalSession` / `requireUser` / `optionalUser` / `requireMembership`.
- `src/middleware.ts` — pure, framework-independent route-protection logic (`isPublicPath`, `isProtectedPath`, `isSafeRedirectPath`, `resolveMiddlewareDecision`). No Next.js import — `apps/web/src/middleware.ts` is the thin adapter. Also reachable via the `@reviewflow/auth/middleware` subpath export, which is self-contained (no `@reviewflow/database` dependency) — see Design notes.
- `src/cookies.ts` — re-exports `@reviewflow/supabase`'s `CookieAdapter`/`CookieToSet` types for convenience.
- `src/types.ts` — `AppUser`, `AuthIdentity`, `AppSession`, `AuthResult`.

## What should NOT be placed here

- Authentication UI (login/signup pages, forms) — this package has no React/Next.js dependency by design.
- Framework-specific glue (Next.js middleware, `cookies()`, Route Handlers) — that lives in `apps/web` (`src/middleware.ts`, `src/lib/api-auth.ts`, `src/lib/supabase.ts`).
- RBAC/permission enforcement — `requireMembership` confirms a membership _exists_; it does not check `role`. See ADR-0005's "Future RBAC" section.
- Business features (agencies, businesses, customers, …) — `syncUser` never creates an agency, membership, or role.
- Anything that talks to Supabase directly without going through `@reviewflow/supabase`'s client factories.

## Usage

```ts
import { createAuthService, requireUser, requireMembership } from "@reviewflow/auth";
import { createRepositories, getDb } from "@reviewflow/database";
import { getServerSupabaseClient } from "../lib/supabase"; // apps/web's Next.js adapter

const supabase = await getServerSupabaseClient();
const repositories = createRepositories(getDb());
const authService = createAuthService({ supabase, users: repositories.users });

// Throws AuthenticationError if unauthenticated:
const user = await requireUser(authService);

// Throws AuthenticationError (no session) or AuthorizationError (no membership):
const { membership } = await requireMembership(authService, repositories.memberships, agencyId);
```

Route Handlers use the `apps/web`-specific wrappers instead of calling the above directly:

```ts
// apps/web/src/app/api/private/me/route.ts
export const GET = withApiContext(
  withUser((_request, { user }) => NextResponse.json(toApiSuccessResponse(user))),
);
```

## Testing

`src/middleware.test.ts` (pure logic) and most of `src/auth-service.test.ts`/`src/session.test.ts` (fully mocked Supabase client and repositories) run unconditionally — no external dependency. A subset — `src/sync-user.test.ts` and `src/session.test.ts`'s `requireMembership` suite — exercises real unique-constraint/relational behavior against a live Postgres database and is gated on `DATABASE_URL`, exactly like `packages/database`'s repository tests (`describe.skipIf(!hasTestDatabase())`, `src/test-db.ts`). No test in this package requires real Supabase Auth credentials — the Supabase client is always a mock in unit tests, since `signUp`/`signIn`/etc. are thin wrappers whose logic (error mapping, session shaping, calling `syncUser`) doesn't need a live identity provider to verify.

```bash
docker run -d -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=reviewflow -p 55432:5432 postgres:16-alpine
export DATABASE_URL=postgresql://postgres:postgres@localhost:55432/reviewflow
pnpm --filter @reviewflow/database run db:migrate
pnpm --filter @reviewflow/auth run test
```

Because these tests share one live database and truncate its tables between tests, `vitest.config.ts` sets `fileParallelism: false`, same as `packages/database`.

## Design notes

- **Constructor-injected dependencies, no global state.** `createAuthService({ supabase, users })` takes an already-constructed Supabase client and `UserRepository` rather than building either itself — keeps this package framework-independent and testable with mocks, and avoids the "do NOT introduce global mutable state" constraint this sprint was built under.
- **`getUser()`, never bare `getSession()`, for anything security-relevant.** `getSession()` only decodes the local cookie; `getUser()` round-trips to Supabase Auth to verify the token. See ADR-0005.
- **The service-role/admin Supabase client is never used here.** Every flow uses the anon-key client — see ADR-0005's "Service-role Supabase client: not used" section for why.
- **Never expose a raw Supabase session, user object, or JWT.** `AppSession`/`AppUser` are this package's own types; access/refresh tokens never leave `auth-service.ts`.
- **Every email comparison goes through `normalizeEmail`** (from `@reviewflow/database`) — `signIn`/`signUp` normalize before calling Supabase, `toAuthIdentity` normalizes every identity built from a Supabase user object, and `syncUser` normalizes again since it's callable directly. See ADR-0005's "Email Normalization" section.
- **Import route-protection logic via `@reviewflow/auth/middleware`, not the package root, from any Edge-runtime code.** The root barrel (`.`) also re-exports `auth-service.ts`, which pulls in `@reviewflow/database`'s Node-only `postgres` driver — incompatible with the Edge runtime `apps/web/src/middleware.ts` runs on. This actually broke a build once (see ADR-0006); the subpath's module graph (`middleware.ts` has zero imports) is what keeps it safe.
- **`requestPasswordReset` never throws**, for the same no-user-enumeration reason `signIn` doesn't reveal whether an email is registered — a failed Supabase call is logged, not surfaced, so the caller can always show the same confirmation message.
