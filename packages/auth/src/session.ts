import { AuthenticationError, AuthorizationError } from "@reviewflow/errors";
import type { MembershipRepository } from "@reviewflow/database";
import type { AuthService } from "./auth-service";
import type { AppSession, AppUser } from "./types";

/** The session if one exists, or `null` — never throws. */
export async function optionalSession(authService: AuthService): Promise<AppSession | null> {
  return authService.getCurrentSession();
}

/** The session, or throws AuthenticationError if the caller isn't signed in. */
export async function requireSession(authService: AuthService): Promise<AppSession> {
  const session = await optionalSession(authService);
  if (!session) {
    throw new AuthenticationError();
  }
  return session;
}

/** The synced application user if a session exists, or `null` — never throws. */
export async function optionalUser(authService: AuthService): Promise<AppUser | null> {
  return authService.getCurrentUser();
}

/** The synced application user, or throws AuthenticationError if the caller isn't signed in. */
export async function requireUser(authService: AuthService): Promise<AppUser> {
  const user = await optionalUser(authService);
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
}

type MembershipRow = NonNullable<Awaited<ReturnType<MembershipRepository["findByAgencyAndUser"]>>>;

export interface MembershipContext {
  user: AppUser;
  membership: MembershipRow;
}

/**
 * Initial membership validation (ARCHITECTURE.md section 6: Authentication
 * → Tenant → Permission): confirms an authenticated user has *some*
 * membership in the given agency. Deliberately does not look at
 * `membership.role` — enforcing specific roles/permissions is future RBAC
 * work (see docs/architecture/0005-authentication-architecture.md).
 */
export async function requireMembership(
  authService: AuthService,
  memberships: MembershipRepository,
  agencyId: string,
): Promise<MembershipContext> {
  const user = await requireUser(authService);
  const membership = await memberships.findByAgencyAndUser(agencyId, user.id);
  if (!membership) {
    throw new AuthorizationError("You do not have access to this agency.");
  }
  return { user, membership };
}
