import { cache } from "react";
import { AuthorizationError } from "@reviewflow/errors";
import {
  requireMembership,
  requireUser,
  type AppUser,
  type MembershipContext,
} from "@reviewflow/auth";
import type { schema } from "@reviewflow/database";
import { getAuthContext } from "./auth-context";

export interface DashboardContext {
  user: AppUser;
  agency: typeof schema.agencies.$inferSelect;
  membership: MembershipContext["membership"];
}

/**
 * Resolves the signed-in user's current agency/membership for the
 * protected app shell — "current" meaning "the first agency this user
 * belongs to," since there is no agency-switching UI yet (see
 * docs/architecture/0006-application-shell.md). Uses `requireMembership`
 * per docs/architecture/0005-authentication-architecture.md — confirms a
 * membership row exists, does not check its role.
 *
 * Throws `AuthenticationError` if there's no valid session (shouldn't
 * happen under the protected layout, since middleware already gated the
 * route, but a session can theoretically expire between the middleware
 * check and this render) and `AuthorizationError` if the user has no
 * agency to belong to. Callers (the protected layout) branch on these to
 * redirect to `/login` or render a friendly access-denied screen,
 * respectively, rather than letting them reach the generic error boundary.
 *
 * Wrapped in React's `cache()` so the layout and any page rendered inside
 * it share one result per request instead of re-querying the database.
 */
export const getDashboardContext = cache(async (): Promise<DashboardContext> => {
  const { authService, repositories } = await getAuthContext();
  const user = await requireUser(authService);

  const agencies = await repositories.users.findUserAgencies(user.id);
  const agency = agencies[0];
  if (!agency) {
    throw new AuthorizationError("You do not belong to any agency yet.");
  }

  const { membership } = await requireMembership(authService, repositories.memberships, agency.id);

  return { user, agency, membership };
});
