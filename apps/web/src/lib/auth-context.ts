import { createRepositories, getDb, type Repositories } from "@reviewflow/database";
import { createAuthService, type AuthService } from "@reviewflow/auth";
import { getServerSupabaseClient } from "./supabase";

export interface AuthContext {
  authService: AuthService;
  repositories: Repositories;
}

/**
 * Builds the auth service + repositories for one Server Component/Route
 * Handler/Server Action's worth of work — the one place that wires
 * `@reviewflow/auth` to this app's Next.js cookie adapter and database
 * connection, so every caller (API wrappers, Server Actions, the protected
 * layout) constructs it the same way. Never cached/reused across requests —
 * see `@reviewflow/supabase`'s design notes on why no global client exists.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await getServerSupabaseClient();
  const repositories = createRepositories(getDb());
  const authService = createAuthService({ supabase, users: repositories.users });
  return { authService, repositories };
}
