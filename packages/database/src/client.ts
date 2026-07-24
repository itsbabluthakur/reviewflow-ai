import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createLogger } from "@reviewflow/logger";
import { DatabaseError } from "@reviewflow/errors";
import { loadDatabaseEnv } from "./env";
import * as schema from "./schema";

const logger = createLogger({ module: "database" });

export type Database = PostgresJsDatabase<typeof schema>;

interface DatabaseClient {
  sql: postgres.Sql;
  db: Database;
}

interface GlobalWithDbClient {
  __reviewflowDbClient?: DatabaseClient | undefined;
}

// Cache the client on `globalThis` — in every environment, not just
// development — so repeated calls (and Next.js dev-mode module reloads)
// reuse one connection pool instead of opening a new one each time.
const globalForDb = globalThis as unknown as GlobalWithDbClient;

function createClient(): DatabaseClient {
  const env = loadDatabaseEnv();
  const sql = postgres(env.DATABASE_URL, { onnotice: () => {} });
  const db = drizzle(sql, { schema });
  logger.info("database client initialized");
  return { sql, db };
}

function getClient(): DatabaseClient {
  globalForDb.__reviewflowDbClient ??= createClient();
  return globalForDb.__reviewflowDbClient;
}

/**
 * Lazily creates (once) and returns the shared Drizzle instance. Lazy is
 * deliberate: importing this module — or `@reviewflow/database` generally —
 * must never require DATABASE_URL to be set, because Next.js evaluates
 * route handler modules to collect their exports during `next build`. Only
 * an actual call to `getDb()` or `checkDatabaseConnection()` should require it.
 */
export function getDb(): Database {
  return getClient().db;
}

/** Lightweight connectivity check for readiness probes — see apps/web's /api/ready. */
export async function checkDatabaseConnection(): Promise<void> {
  try {
    await getClient().sql`select 1`;
  } catch (error) {
    logger.error({ err: error }, "database connectivity check failed");
    throw new DatabaseError("Database connection check failed.", { cause: error });
  }
}

/** Closes the underlying connection pool. Call on graceful shutdown (scripts, tests). */
export async function closeDatabaseConnection(): Promise<void> {
  if (globalForDb.__reviewflowDbClient) {
    await globalForDb.__reviewflowDbClient.sql.end();
    globalForDb.__reviewflowDbClient = undefined;
  }
}
