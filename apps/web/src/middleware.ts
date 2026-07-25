import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@reviewflow/supabase";
// Deliberately the `/middleware` subpath, not the package root: the root
// barrel also re-exports auth-service.ts, which pulls in
// @reviewflow/database's Node-only `postgres` driver — incompatible with
// this file's Edge runtime. This subpath's module graph is self-contained
// (see packages/auth/src/middleware.ts — zero imports), so only it is
// ever bundled here. See docs/architecture/0006-application-shell.md.
import { isProtectedPath, resolveMiddlewareDecision } from "@reviewflow/auth/middleware";
import { AuthenticationError, getStatusCode, toApiErrorResponse } from "@reviewflow/errors";

export const REQUEST_ID_HEADER = "x-request-id";
export const CORRELATION_ID_HEADER = "x-correlation-id";

/**
 * Assigns a request ID (always fresh) and correlation ID (reused from an
 * inbound caller if present, e.g. a future public API or upstream proxy) to
 * every request, before any route handler runs, then — for protected paths
 * only — verifies the caller has a valid Supabase session and redirects to
 * `/login` if not.
 *
 * Runs on the Edge runtime by default, which doesn't support Pino's
 * worker-thread-based transports — deliberately no `@reviewflow/logger`
 * import here (see docs/architecture/0003-observability-and-error-handling.md);
 * `@supabase/ssr` is fetch-based and Edge-safe. Route handlers (Node
 * runtime) read the request-id/correlation-id headers back out via
 * apps/web/src/lib/request-context.ts to bind a real logger for the rest of
 * the request.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const correlationId = request.headers.get(CORRELATION_ID_HEADER) ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);
  requestHeaders.set(CORRELATION_ID_HEADER, correlationId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  response.headers.set(CORRELATION_ID_HEADER, correlationId);

  const { pathname, search } = request.nextUrl;

  // Skip the Supabase round-trip entirely for paths that don't need auth.
  // Note this middleware never imports @reviewflow/database — "skip
  // database lookup when session missing" holds by construction, since
  // route protection here only ever checks Supabase's own session, never
  // the application database (see ADR-0005).
  if (!isProtectedPath(pathname)) {
    return response;
  }

  const hasSession = await hasValidSession(request, response);
  const decision = resolveMiddlewareDecision({ pathname, search, hasSession });

  if (decision.action === "redirect") {
    return NextResponse.redirect(new URL(decision.location, request.url));
  }

  if (decision.action === "deny") {
    // API routes (/api/private/*) get the standard JSON error envelope, not
    // an HTML redirect to a login page — a fetch() caller has no use for one.
    const error = new AuthenticationError();
    return NextResponse.json(toApiErrorResponse(error), { status: getStatusCode(error) });
  }

  return response;
}

/**
 * Verifies the session server-side via `getUser()` (contacts Supabase Auth
 * to validate the token) rather than trusting the locally decoded
 * `getSession()` claims — see SECURITY.md section 2/12. If Supabase isn't
 * configured at all (e.g. local dev/CI without credentials), fails closed:
 * treats the request as unauthenticated rather than crashing it or, worse,
 * letting it through — per SECURITY.md section 1, "Secure by Default".
 */
async function hasValidSession(request: NextRequest, response: NextResponse): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient({
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          // See apps/web/src/lib/supabase.ts for why this cast is needed —
          // @supabase/ssr's cookie-option shape isn't nominally identical
          // to Next.js's, only structurally compatible at runtime.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see comment above
          response.cookies.set(name, value, options as any);
        }
      },
    });

    const { data, error } = await supabase.auth.getUser();
    return !error && Boolean(data.user);
  } catch (error) {
    console.warn("middleware: could not verify session, denying access to protected route", error);
    return false;
  }
}

export const config = {
  // Every request except static assets and the Next.js internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
