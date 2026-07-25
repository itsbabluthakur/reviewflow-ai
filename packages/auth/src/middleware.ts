/**
 * Framework-independent route-protection logic. apps/web/src/middleware.ts
 * is the thin Next.js adapter: it checks the Supabase session (Edge-safe,
 * no database lookup — see docs/architecture/0005-authentication-architecture.md)
 * and calls resolveMiddlewareDecision with the result.
 */

const LOGIN_PATH = "/login";
export const REDIRECT_PARAM = "redirect";

/** Exact-match public routes — never gated even without a session. */
export const PUBLIC_PATHS: readonly string[] = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/live",
  "/api/ready",
];

/** Path prefixes that require a session — matches the path itself or anything nested under it. */
export const PROTECTED_PREFIXES: readonly string[] = [
  "/dashboard",
  "/settings",
  "/account",
  "/profile",
  "/api/private",
];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export interface MiddlewareInput {
  pathname: string;
  /** The request's query string, including its leading `?` if present. */
  search?: string;
  hasSession: boolean;
}

export type MiddlewareDecision =
  { action: "allow" } | { action: "redirect"; location: string } | { action: "deny" };

/** API routes get a JSON 401 (see "deny" below), never an HTML redirect to a login page. */
function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

/**
 * Pure route-protection decision: unprotected paths and requests with a
 * verified session are always allowed through. Unauthenticated requests to
 * a protected *page* path are redirected to `/login`, preserving the
 * original destination in a `redirect` query param. Unauthenticated
 * requests to a protected *API* path (`/api/private/*`) get "deny" instead
 * — the caller (apps/web/src/middleware.ts) turns that into a standard
 * AuthenticationError JSON response, since a fetch() call has no use for an
 * HTML redirect. Because only paths in PROTECTED_PREFIXES ever redirect or
 * deny, and `/login` itself is never one of them, this can't produce a
 * redirect loop.
 */
export function resolveMiddlewareDecision(input: MiddlewareInput): MiddlewareDecision {
  const { pathname, search = "", hasSession } = input;

  if (hasSession || !isProtectedPath(pathname)) {
    return { action: "allow" };
  }

  if (isApiPath(pathname)) {
    return { action: "deny" };
  }

  const redirectTarget = encodeURIComponent(`${pathname}${search}`);
  return { action: "redirect", location: `${LOGIN_PATH}?${REDIRECT_PARAM}=${redirectTarget}` };
}

/**
 * Guards against an open redirect: only a same-origin, relative path is a
 * safe post-login destination. Rejects anything that isn't a relative path
 * (`https://evil.example`), and protocol-relative URLs (`//evil.example`,
 * which browsers resolve to `https://evil.example`) — both of which a
 * `?redirect=` query param would otherwise let an attacker control. The
 * login page must fall back to a default destination (e.g. `/dashboard`)
 * when this returns false.
 */
export function isSafeRedirectPath(path: string): boolean {
  if (!path.startsWith("/")) {
    return false;
  }
  return !path.startsWith("//") && !path.startsWith("/\\");
}
