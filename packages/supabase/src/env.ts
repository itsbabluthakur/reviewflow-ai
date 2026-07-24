import { z } from "zod";
import { parseEnv } from "@reviewflow/config";

/**
 * Vars needed by the browser and server (anon-key) clients. The service-role
 * key is validated separately, only inside createAdminSupabaseClient — see
 * that file for why it's kept out of this shared schema.
 */
const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({
    message: "NEXT_PUBLIC_SUPABASE_URL must be set to a valid Supabase project URL.",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY must be set."),
});

export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;

let cachedSupabaseEnv: SupabaseEnv | undefined;

export function loadSupabaseEnv(source: NodeJS.ProcessEnv = process.env): SupabaseEnv {
  if (cachedSupabaseEnv) {
    return cachedSupabaseEnv;
  }
  cachedSupabaseEnv = parseEnv(supabaseEnvSchema, source, "Supabase environment variables");
  return cachedSupabaseEnv;
}

/** Test-only escape hatch: forces the next {@link loadSupabaseEnv} call to re-parse. */
export function resetSupabaseEnvCache(): void {
  cachedSupabaseEnv = undefined;
}
