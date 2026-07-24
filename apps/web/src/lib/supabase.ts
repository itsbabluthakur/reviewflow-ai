import { cookies } from "next/headers";
import { createServerSupabaseClient, type SupabaseClient } from "@reviewflow/supabase";

/**
 * The Next.js-specific cookie adapter `@reviewflow/supabase`'s
 * `createServerSupabaseClient` needs — kept here, not in the shared
 * package, so that package stays framework-agnostic (see its README).
 */
export async function getServerSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerSupabaseClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      try {
        for (const { name, value, options } of cookiesToSet) {
          // `options`' shape comes from @supabase/ssr, not Next.js — the two
          // libraries' cookie-option types are structurally compatible at
          // runtime but not nominally identical, so TS can't unify them.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see comment above
          cookieStore.set(name, value, options as any);
        }
      } catch {
        // Called from a Server Component, where cookies can't be written —
        // fine here, since there's no session-refresh flow yet to need it.
      }
    },
  });
}
