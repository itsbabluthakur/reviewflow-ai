/**
 * Re-exported from @reviewflow/supabase rather than redefined here — this
 * package builds its Supabase server client the same way
 * createServerSupabaseClient does (see auth-service.ts's createAuthClient),
 * so it uses the identical cookie-adapter shape. Framework adapters (Next.js
 * middleware, Next.js Server Components) live in apps/web, not here — see
 * this package's README and @reviewflow/supabase's for why.
 */
export type { CookieAdapter, CookieToSet } from "@reviewflow/supabase";
