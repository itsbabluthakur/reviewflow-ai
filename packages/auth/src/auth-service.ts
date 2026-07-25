import type { SupabaseClient } from "@reviewflow/supabase";
import { normalizeEmail, type UserRepository } from "@reviewflow/database";
import { AuthenticationError } from "@reviewflow/errors";
import { createLogger } from "@reviewflow/logger";
import type { AppSession, AppUser, AuthIdentity, AuthResult } from "./types";

const logger = createLogger({ module: "auth" });

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  fullName?: string;
}

export interface AuthServiceDeps {
  supabase: SupabaseClient;
  /** Only `UserRepository` is needed here — agencies/memberships are session.ts's concern (requireMembership). */
  users: UserRepository;
}

export interface AuthService {
  signUp(credentials: SignUpCredentials): Promise<AuthResult>;
  signIn(credentials: AuthCredentials): Promise<AuthResult>;
  signOut(): Promise<void>;
  refreshSession(): Promise<AppSession | null>;
  getCurrentSession(): Promise<AppSession | null>;
  getCurrentUser(): Promise<AppUser | null>;
  syncUser(identity: AuthIdentity): Promise<AppUser>;
  requestPasswordReset(email: string): Promise<void>;
}

interface RawSupabaseUser {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

/**
 * Builds an auth-domain identity from a raw Supabase auth user, pulling
 * optional profile fields out of its metadata. Normalizes the email (see
 * normalizeEmail) — never compare raw email strings.
 */
function toAuthIdentity(user: RawSupabaseUser): AuthIdentity {
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : undefined;
  const avatarUrl =
    typeof metadata.avatar_url === "string"
      ? metadata.avatar_url
      : typeof metadata.picture === "string"
        ? metadata.picture
        : undefined;

  return {
    id: user.id,
    email: normalizeEmail(user.email ?? ""),
    ...(fullName !== undefined ? { fullName } : {}),
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
  };
}

/**
 * Validates the current session server-side via `getUser()`, which
 * contacts Supabase Auth to verify the token, rather than trusting the
 * locally decoded `getSession()` claims — see SECURITY.md sections 2 and 12
 * ("never trust client cookies"; "validate every session server-side").
 */
async function getValidatedIdentity(supabase: SupabaseClient): Promise<AuthIdentity | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return toAuthIdentity(data.user);
}

/**
 * Creates the auth service for one request/session's worth of work. Takes
 * an already-constructed Supabase client and `UserRepository` as
 * dependencies (constructor injection) rather than creating either itself —
 * keeps this package framework-independent and avoids any global mutable
 * state (see this package's README and SUPABASE section of
 * docs/architecture/0005-authentication-architecture.md).
 */
export function createAuthService(deps: AuthServiceDeps): AuthService {
  const { supabase, users } = deps;

  async function syncUser(identity: AuthIdentity): Promise<AppUser> {
    // Callable directly (not just via signIn/signUp/toAuthIdentity), so
    // normalize here too — never compare raw email strings.
    const email = normalizeEmail(identity.email);

    const byAuthId = await users.findByAuthUserId(identity.id);
    if (byAuthId) {
      return byAuthId;
    }

    const byEmail = await users.findByEmail(email);
    if (byEmail) {
      // Only auth_user_id is touched — the application user is the source
      // of truth for business data (name, avatar), so an existing user's
      // profile is never overwritten by identity metadata.
      const linked = await users.linkAuthUserId(byEmail.id, identity.id);
      return linked ?? byEmail;
    }

    return users.create({
      email,
      fullName: identity.fullName ?? email,
      avatarUrl: identity.avatarUrl ?? null,
      authUserId: identity.id,
    });
  }

  async function buildSession(): Promise<AppSession | null> {
    const identity = await getValidatedIdentity(supabase);
    if (!identity) {
      return null;
    }
    const { data } = await supabase.auth.getSession();
    return { identity, expiresAt: data.session?.expires_at ?? 0 };
  }

  return {
    async signUp({ email, password, fullName }) {
      const normalizedEmail = normalizeEmail(email);
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        ...(fullName ? { options: { data: { full_name: fullName } } } : {}),
      });
      if (error || !data.user) {
        logger.warn({ code: error?.code }, "sign-up failed");
        throw new AuthenticationError(
          "Could not create an account with the details provided.",
          error ? { cause: error } : {},
        );
      }

      const identity = toAuthIdentity(data.user);
      const user = await syncUser(identity);
      const session = data.session ? { identity, expiresAt: data.session.expires_at ?? 0 } : null;
      return { user, session };
    },

    async signIn({ email, password }) {
      const normalizedEmail = normalizeEmail(email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error || !data.user || !data.session) {
        logger.warn({ code: error?.code }, "sign-in failed");
        // Deliberately generic — never reveal whether the email is
        // registered (SECURITY.md section 2, "no user enumeration").
        throw new AuthenticationError("Invalid email or password.", error ? { cause: error } : {});
      }

      const identity = toAuthIdentity(data.user);
      const user = await syncUser(identity);
      return { user, session: { identity, expiresAt: data.session.expires_at ?? 0 } };
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new AuthenticationError("Failed to sign out.", { cause: error });
      }
    },

    async refreshSession() {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        logger.warn({ code: error.code }, "session refresh failed");
        return null;
      }
      return buildSession();
    },

    getCurrentSession: buildSession,

    async getCurrentUser() {
      const session = await buildSession();
      if (!session) {
        return null;
      }
      return syncUser(session.identity);
    },

    syncUser,

    async requestPasswordReset(email) {
      const normalizedEmail = normalizeEmail(email);
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
      if (error) {
        // Deliberately swallowed, not thrown — the caller (the
        // forgot-password page) always shows the same generic
        // confirmation regardless of outcome. Surfacing this would let an
        // attacker distinguish a registered email from an unregistered one
        // (SECURITY.md section 2, "no user enumeration").
        logger.warn({ code: error.code }, "password reset request failed");
      }
    },
  };
}
