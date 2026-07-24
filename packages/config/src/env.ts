import { z } from "zod";

/**
 * Schema for environment variables the app actually reads today. Extend
 * this as features that need new variables land — see .env.example for the
 * full catalog of variables reserved for future integrations. Unknown keys
 * (every other process.env entry) are silently stripped, not rejected.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
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

  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/** Test-only escape hatch: forces the next {@link loadEnv} call to re-parse. */
export function resetEnvCache(): void {
  cachedEnv = undefined;
}
