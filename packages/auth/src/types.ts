import type { schema } from "@reviewflow/database";

/**
 * The application's `users` row — the source of truth for business data
 * (name, avatar, etc). Not the same thing as a Supabase Auth identity; see
 * AuthIdentity and docs/architecture/0005-authentication-architecture.md.
 */
export type AppUser = typeof schema.users.$inferSelect;

/**
 * The identity Supabase Auth has verified, before any application-user sync
 * happens. `fullName`/`avatarUrl` come from the identity's own metadata
 * (e.g. an OAuth provider or signUp options) and are only ever used to
 * populate a *new* application user — see syncUser in auth-service.ts.
 */
export interface AuthIdentity {
  /** Supabase `auth.users.id` — stored on the application user as `authUserId`. */
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

/**
 * A verified session, wrapping only what callers need. Deliberately never
 * the raw Supabase session/JWT — see SECURITY.md section 12 ("never store
 * JWTs in local storage") and section 17 ("never log access/refresh
 * tokens"). `expiresAt` is a Unix timestamp (seconds), 0 if unknown.
 */
export interface AppSession {
  identity: AuthIdentity;
  expiresAt: number;
}

/**
 * Result of signUp/signIn. `session` is null when signUp succeeds but the
 * project requires email confirmation before a session is issued — the
 * application user still gets synced (see syncUser) even without one.
 */
export interface AuthResult {
  user: AppUser;
  session: AppSession | null;
}
