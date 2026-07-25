# ADR-0006: Application shell — first production UI

**Status:** Accepted
**Date:** 2026-07-26

## Context

Sprints 3A–3B built the domain schema and the authentication layer, but the application had no user interface beyond a placeholder home page and infrastructure health checks. This sprint builds the first real UI: public auth pages (login/signup/forgot-password) and a protected application shell (dashboard/account/settings/profile) — a SaaS scaffold future features plug into, not a feature-specific dashboard. No business logic (reviews, customers, businesses, billing) was introduced; where the sidebar references those, they're disabled placeholders.

## Decision

### Application Shell

The shell is deliberately split by what layer owns it, mirroring `ARCHITECTURE.md` section 4:

- **`packages/auth`** — identity, session, and route-protection logic (unchanged this sprint, except a new `/profile` protected prefix and `requestPasswordReset`/`isSafeRedirectPath` additions — see below).
- **`packages/validation`** — new this sprint: `loginSchema`, `signupSchema`, `forgotPasswordSchema` (Zod), shared between each form's client-side validation and its Server Action, so the two can never drift apart.
- **`packages/ui`** — five new shadcn/ui primitives (`Avatar`, `DropdownMenu`, `Label`, `Separator`, `Skeleton`), generated in the same style as the existing `Button`/`Card`/`Dialog`/`Input`.
- **`apps/web`** — every composed, app-specific component (`Sidebar`, `Navbar`, `UserMenu`, `DashboardShell`, `PageHeader`, `Section`, `EmptyState`, `AccessDenied`, form helpers) lives in `apps/web/src/components/`, per `packages/ui`'s own README ("one-off components only ever used by a single app... stay local to that app until a second consumer appears"). Pages and Server Actions never call `@reviewflow/database` directly — they go through `packages/auth`'s `AuthService`/session helpers and `@reviewflow/database`'s `createRepositories`, via two small `apps/web/src/lib/` helpers (`getAuthContext`, `getDashboardContext`).

### Protected Layout

`app/(protected)/layout.tsx` is a route group (no URL segment of its own) wrapping `/dashboard`, `/account`, `/settings`, `/profile` in one shared shell. It resolves `getDashboardContext()` (user + first agency + membership) once and branches on the two _expected_ failure modes **before** they'd otherwise reach a generic error boundary:

- `AuthenticationError` → `redirect("/login")` — the middleware already gated this route, so this only fires if the session expired between that check and this render.
- `AuthorizationError` (no agency) → renders `<AccessDenied />` inline, not a thrown error.

This matters because Next.js strips custom error subclasses down to a generic `Error` by the time `error.tsx` sees them in production (`instanceof` checks on a client error boundary don't survive serialization) — so the branching has to happen server-side, in the layout itself, not in the error boundary. `error.tsx` (root-level) exists only for genuinely unexpected failures: friendly message, retry button, no technical details (`UI_GUIDELINES.md` section 20).

### Navigation

`Sidebar` renders one list (`nav-items.ts`) twice — as a persistent desktop `<aside>` (`md:flex`, hidden below that breakpoint) and as a mobile drawer built on the existing `Dialog` primitive repositioned via className overrides (`tailwind-merge` resolves the conflicting position utilities) — so there's exactly one place to add a nav item, not two. Real items (`Dashboard`, `Account`, `Settings`) are links; future items (`Reviews`, `Customers`, `Businesses`, `Campaigns`, `Analytics`) render as `disabled` buttons labeled "Soon" — native `disabled` semantics, not a custom ARIA hack. `Navbar` shows the agency name and `UserMenu` (avatar, dropdown: Profile/Account/Settings/Log out); search, theme toggle, and notifications are deliberately disabled placeholders this sprint (not implemented — see Technical Debt).

### Session Flow

```
Login/Signup form (Client Component)
        │  useActionState + Server Action
        ▼
Server Action ("use server")
        │  packages/validation (Zod) → packages/auth (AuthService)
        ▼
signIn/signUp → syncUser (unchanged from ADR-0005)
        │
        ▼
redirect() — /dashboard, or the validated `?redirect=` target
```

- **Login respects `?redirect=`**, validated by `isSafeRedirectPath` (new in `packages/auth/src/middleware.ts`) before use — rejects protocol-relative (`//evil.example`) and absolute (`https://evil.example`) targets, falling back to `/dashboard`. This closes an open-redirect risk the `?redirect=` param would otherwise create.
- **Login never reveals unknown-email vs. wrong-password** — `signIn`'s existing generic `AuthenticationError` message surfaces as-is; any _other_ thrown error is logged server-side and shown as a separate generic "Something went wrong" message, so real failures stay observable without leaking detail to the user.
- **Signup** always shows the same account-creation flow (`signUp` → `syncUser` → redirect `/dashboard`) already built in ADR-0005 — no agency/membership is created here, on purpose.
- **Forgot password** is real, not decorative: a new `AuthService.requestPasswordReset(email)` (mirrors `signIn`/`signUp`'s pattern — normalizes the email, calls Supabase, and **never throws**, so the page always shows the same confirmation regardless of whether the email is registered).
- **Logout** is a Server Action (`apps/web/src/lib/sign-out-action.ts`) calling `authService.signOut()` then `redirect("/")`, invoked directly from `UserMenu` (a Client Component calling a Server Action as a plain async function — no form needed).

### Dashboard Structure

`/dashboard` shows real data (welcome message, agency name, role, signed-in email) plus two deliberately empty/disabled sections — "Recent activity" (`EmptyState`) and "Quick actions" (disabled buttons) — because this sprint is scaffold, not a business dashboard. `/profile`, `/account`, `/settings` each render one `Card` with real authenticated-user data and no editing (per this sprint's explicit scope). All four pages call `getDashboardContext()`, wrapped in React's `cache()` so the layout and the page inside it share one resolution per request instead of querying twice.

## Consequences

- **Two real bugs were found and fixed during this sprint's own build validation, not left to be discovered later:**
  1. `apps/web/src/middleware.ts` imported the full `@reviewflow/auth` barrel, which transitively pulls in `auth-service.ts` → `@reviewflow/database` → the Node-only `postgres` driver — incompatible with the Edge runtime `next build` targets middleware for. Fixed by adding a dedicated `@reviewflow/auth/middleware` subpath export (`packages/auth/package.json`) whose module graph is self-contained (`middleware.ts` has zero imports), and pointing the Edge middleware at that subpath instead of the package root.
  2. `packages/ui/src/components/ui/button.tsx` never had a `"use client"` directive. It compiled and worked for a plain `<button>`, but `asChild` renders `@radix-ui/react-slot`, which calls `React.createContext()` at module scope — unconditionally, on import, regardless of whether `asChild` is actually used. React's Server Components condition doesn't support that call, so the _first_ page in this sprint to render `<Button asChild>` (a Server Component, e.g. `not-found.tsx`) crashed the build with a cryptic `"createContext is not a function"` during Next's page-data-collection step. No earlier sprint had rendered `Button` at all, so this latent bug was invisible until now. Fixed by adding `"use client"` to `button.tsx`.
- Every future protected page reuses `getDashboardContext()` rather than re-deriving user/agency/membership by hand.
- Adding the next sidebar section (e.g. Reviews, once that sprint lands) is a one-line move from `COMING_SOON_ITEMS` to `NAV_ITEMS` in `nav-items.ts` — no other file changes.
- Search, theme toggling, and notifications remain unimplemented placeholders — `UI_GUIDELINES.md` sections 15 and 21 describe fuller requirements (toast placement, full dark-mode parity with persistence) that are out of this sprint's scope entirely, not partially done.
