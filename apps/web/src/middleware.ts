import { NextResponse, type NextRequest } from "next/server";

export const REQUEST_ID_HEADER = "x-request-id";
export const CORRELATION_ID_HEADER = "x-correlation-id";

/**
 * Assigns a request ID (always fresh) and correlation ID (reused from an
 * inbound caller if present, e.g. a future public API or upstream proxy) to
 * every request, before any route handler runs. Deliberately does nothing
 * else — no logger/DB import here.
 *
 * Runs on the Edge runtime by default, which doesn't support Pino's
 * worker-thread-based transports. Route handlers (Node runtime) read these
 * headers back out via apps/web/src/lib/request-context.ts to bind a real
 * logger for the rest of the request.
 */
export function middleware(request: NextRequest): NextResponse {
  const requestId = crypto.randomUUID();
  const correlationId = request.headers.get(CORRELATION_ID_HEADER) ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);
  requestHeaders.set(CORRELATION_ID_HEADER, correlationId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  response.headers.set(CORRELATION_ID_HEADER, correlationId);
  return response;
}

export const config = {
  // Every request except static assets and the Next.js internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
