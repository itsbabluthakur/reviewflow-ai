import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadSupabaseEnv } from "../env";

export interface CookieToSet {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

/**
 * Minimal cookie adapter `@supabase/ssr`'s server client needs to read/
 * refresh the session cookie. Deliberately generic, not Next.js-specific —
 * this package stays framework-agnostic; the Next.js adapter (built on
 * `next/headers`'s `cookies()`) lives in apps/web/src/lib/supabase.ts.
 */
export interface CookieAdapter {
  getAll(): { name: string; value: string }[];
  setAll(cookiesToSet: CookieToSet[]): void;
}

/**
 * A Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Uses the public anon key — relies on Row Level Security,
 * same as the browser client, but can additionally read/refresh the
 * session cookie via the adapter passed in.
 */
export function createServerSupabaseClient(cookies: CookieAdapter): SupabaseClient {
  const env = loadSupabaseEnv();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies,
  });
}
