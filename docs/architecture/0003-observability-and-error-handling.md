# ADR-0003: Structured logging, error hierarchy, and request context

**Status:** Accepted
**Date:** 2026-07-24

## Context

Before this sprint, the platform had no structured logging, no typed error hierarchy, and no way to correlate a single request's logs across route handlers and the packages they call. `CLAUDE.md` forbids stray `console.log`, `SECURITY.md` section 17 specifies exactly what must (request IDs, errors, user/tenant ID, timestamp) and must not (secrets, tokens) be logged, and `API.md` section 3 defines a single standard success/error response envelope every endpoint should return — none of which had an actual implementation to enforce them.

## Decision

- **Pino (`packages/logger`) is the only sanctioned logging surface.** Pretty, colorized output outside production; newline-delimited JSON in production — one conditional `transport` option, not two code paths.
- **Request/correlation IDs are assigned by Edge-safe middleware** (`apps/web/src/middleware.ts`) that does nothing but generate/propagate two headers via `crypto.randomUUID()` — deliberately no logger import, since Pino's transports rely on Node APIs (`worker_threads`) the Edge runtime doesn't support, and Next.js middleware runs on the Edge runtime by default.
- **Request-scoped logging is threaded through Node-runtime route handlers via `AsyncLocalStorage`** (`packages/logger`'s `runWithRequestContext`/`getContextLogger`), which survives `await` boundaries without passing a context object through every function signature. `apps/web/src/lib/request-context.ts`'s `withApiContext` wrapper reads the IDs middleware attached, binds the context, logs start/end with duration, and is the one place every future Route Handler should start from.
- **`@reviewflow/errors` defines the one error hierarchy** (`AppError` base, `ValidationError` / `ConfigurationError` / `DatabaseError`) instead of every package throwing bare `Error` or hand-rolling its own response shape. `toApiErrorResponse`/`toApiSuccessResponse` build exactly the envelope `API.md` section 3 documents; a thrown value that _isn't_ an `AppError` is never reflected back to the client — it becomes a generic `INTERNAL_ERROR`, per `SECURITY.md` section 9's "don't reveal internal implementation details."
- **Stack traces are attached to log output only outside production** (`serializeError`'s default, overridable), and never appear in the HTTP response body at all, in any environment — per `CLAUDE.md`'s Error Handling section and `SECURITY.md` section 9.

## Consequences

- Every future Route Handler wraps its logic in `withApiContext` to get request-scoped structured logging and consistent error-to-response conversion for free — see `apps/web/src/app/api/{live,ready}/route.ts` for the pattern. A thrown error anywhere inside is caught, logged (with `serializeError`), and converted to the standard error envelope instead of surfacing an unhandled-exception 500.
- `packages/logger` and `packages/errors` have zero framework dependencies — no `next` import anywhere in either. They're equally usable from a Route Handler, a script (`packages/database/src/migrate.ts`, `seed.ts` both use `createLogger`), or a future background worker without modification.
- Logging a caught error always goes through `serializeError`, never `console.log`/`console.error` directly, so the "no console.log outside `packages/logger`" rule has one enforcement point to check, not one per call site.
