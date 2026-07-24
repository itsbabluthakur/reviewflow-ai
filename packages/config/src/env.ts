import { z } from "zod";
import { parseEnv } from "./parse-env";

/**
 * Schema for environment variables the app actually reads today. Extend
 * this as features that need new variables land — see .env.example for the
 * full catalog of variables reserved for future integrations. Unknown keys
 * (every other process.env entry) are silently stripped, not rejected.
 *
 * Vars required by a specific package (e.g. DATABASE_URL by
 * @reviewflow/database) are `.optional()` here — this schema only checks
 * *shape*, so an app that doesn't touch that package isn't blocked from
 * booting. The owning package validates its own vars as required, lazily,
 * at the point of use (see packages/database/src/env.ts).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
  DATABASE_URL: z.url().optional(),
  DATABASE_POOL_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

/**
 * Parse and validate `process.env` against {@link envSchema}, caching the
 * result. Reports every invalid/missing variable at once rather than
 * failing on the first one, so misconfiguration is fixed in a single pass.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = parseEnv(envSchema, source, "environment variables");
  return cachedEnv;
}

/** Test-only escape hatch: forces the next {@link loadEnv} call to re-parse. */
export function resetEnvCache(): void {
  cachedEnv = undefined;
}
