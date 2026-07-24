import { z } from "zod";
import { parseEnv } from "@reviewflow/config";

/**
 * Unlike @reviewflow/config's shared schema (where DATABASE_URL is
 * optional, so apps that don't touch the database aren't blocked from
 * booting), this schema requires it — validated lazily, only when
 * something actually asks for a database connection (see client.ts).
 */
const databaseEnvSchema = z.object({
  DATABASE_URL: z.url({
    message: "DATABASE_URL must be set to a valid PostgreSQL connection string.",
  }),
  DATABASE_POOL_URL: z.url().optional(),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

let cachedDatabaseEnv: DatabaseEnv | undefined;

export function loadDatabaseEnv(source: NodeJS.ProcessEnv = process.env): DatabaseEnv {
  if (cachedDatabaseEnv) {
    return cachedDatabaseEnv;
  }
  cachedDatabaseEnv = parseEnv(databaseEnvSchema, source, "database environment variables");
  return cachedDatabaseEnv;
}

/** Test-only escape hatch: forces the next {@link loadDatabaseEnv} call to re-parse. */
export function resetDatabaseEnvCache(): void {
  cachedDatabaseEnv = undefined;
}
