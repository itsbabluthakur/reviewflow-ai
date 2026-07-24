import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadSupabaseEnv } from "../env";

/**
 * A Supabase client for use in Client Components. Uses the public anon key
 * only — safe to call from browser code (relies on Row Level Security for
 * data access, per SECURITY.md section 6, once real tables/policies exist).
 *
 * Not yet typed against a generated `Database` schema — there are no tables
 * yet (see this sprint's scope). Once Sprint 2+ adds real tables, generate
 * types with the Supabase CLI and parameterize this as
 * `createBrowserClient<Database>(...)`.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  const env = loadSupabaseEnv();
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
