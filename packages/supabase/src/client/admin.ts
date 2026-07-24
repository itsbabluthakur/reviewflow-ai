import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { parseEnv } from "@reviewflow/config";
import { ConfigurationError } from "@reviewflow/errors";
import { loadSupabaseEnv } from "../env";

// Kept separate from env.ts's shared schema on purpose: reading (let alone
// requiring) the service-role key should only happen at the one call site
// that actually needs it, not every time any Supabase client is created.
const adminEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY must be set to use the admin client."),
});

/**
 * A Supabase client using the service-role key — bypasses Row Level
 * Security entirely. Server-only, by construction: throws if called where
 * a `window` global exists, so an accidental import into client-bundled
 * code fails loudly instead of shipping the service-role key to a browser.
 *
 * Per SECURITY.md section 6 ("service-role operations are restricted to
 * trusted backend environments"), use this only for backend jobs that
 * genuinely need to act outside tenant/RLS boundaries — not as a shortcut
 * around writing a policy.
 */
export function createAdminSupabaseClient(): SupabaseClient {
  if ("window" in globalThis) {
    throw new ConfigurationError(
      "createAdminSupabaseClient must never run in a browser context — it uses the service-role key, which bypasses Row Level Security.",
    );
  }

  const { NEXT_PUBLIC_SUPABASE_URL } = loadSupabaseEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = parseEnv(
    adminEnvSchema,
    process.env,
    "Supabase admin environment variables",
  );

  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
