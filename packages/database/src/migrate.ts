import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { createLogger } from "@reviewflow/logger";
import { loadDatabaseEnv } from "./env";

const logger = createLogger({ module: "database:migrate" });

// Resolves relative to this file's location when run via `tsx src/migrate.ts`
// (the package.json db:migrate script) — not meant to run from a build output.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../../../supabase/migrations");

async function main(): Promise<void> {
  const env = loadDatabaseEnv();
  const sql = postgres(env.DATABASE_URL, { max: 1, onnotice: () => {} });
  const db = drizzle(sql);

  try {
    logger.info({ migrationsFolder }, "running migrations");
    await migrate(db, { migrationsFolder });
    logger.info("migrations complete");
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  logger.error({ err: error }, "migration failed");
  process.exitCode = 1;
});
