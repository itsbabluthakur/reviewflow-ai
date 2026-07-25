import { type NextRequest, type NextResponse } from "next/server";
import {
  requireMembership,
  requireSession,
  requireUser,
  type AppSession,
  type AppUser,
  type MembershipContext,
} from "@reviewflow/auth";
import type { ApiRouteHandler } from "./request-context";
import { getAuthContext } from "./auth-context";

export type SessionRouteHandler = (
  request: NextRequest,
  context: { session: AppSession },
) => Promise<NextResponse> | NextResponse;

export type UserRouteHandler = (
  request: NextRequest,
  context: { user: AppUser },
) => Promise<NextResponse> | NextResponse;

export type MembershipRouteHandler = (
  request: NextRequest,
  context: MembershipContext,
) => Promise<NextResponse> | NextResponse;

/**
 * Requires a verified Supabase session — no application-user sync/database
 * lookup — before invoking `handler`. A thrown AuthenticationError
 * propagates to whatever wraps this (normally `withApiContext`, which
 * converts it to the standard API.md error envelope) — these wrappers
 * deliberately don't catch anything themselves, so there's exactly one
 * place (`withApiContext`) that turns an AppError into a response.
 *
 * Usage: `export const GET = withApiContext(withAuth(handler));`
 */
export function withAuth(handler: SessionRouteHandler): ApiRouteHandler {
  return async (request) => {
    const { authService } = await getAuthContext();
    const session = await requireSession(authService);
    return handler(request, { session });
  };
}

/**
 * Requires a synced application user (session + database sync via
 * `syncUser`) before invoking `handler`.
 *
 * Usage: `export const GET = withApiContext(withUser(handler));`
 */
export function withUser(handler: UserRouteHandler): ApiRouteHandler {
  return async (request) => {
    const { authService } = await getAuthContext();
    const user = await requireUser(authService);
    return handler(request, { user });
  };
}

/**
 * Requires the caller to have a membership in the agency `getAgencyId`
 * resolves from the request (e.g. a route param or query string) before
 * invoking `handler`. Only existence is checked, per
 * docs/architecture/0005-authentication-architecture.md — no role/permission
 * enforcement, which is future RBAC work.
 *
 * Usage: `export const GET = withApiContext(withMembership(getAgencyId, handler));`
 */
export function withMembership(
  getAgencyId: (request: NextRequest) => string,
  handler: MembershipRouteHandler,
): ApiRouteHandler {
  return async (request) => {
    const { authService, repositories } = await getAuthContext();
    const agencyId = getAgencyId(request);
    const context = await requireMembership(authService, repositories.memberships, agencyId);
    return handler(request, context);
  };
}
