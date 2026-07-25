import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createRepositories, schema, type Repositories } from "@reviewflow/database";

/**
 * Test-only helper mirroring packages/database/src/repository/test-db.ts —
 * syncUser and requireMembership need real unique-constraint/relational
 * behavior that isn't meaningfully mockable, but only via this package's
 * public @reviewflow/database exports (schema, createRepositories), not
 * that package's internal test helper. Gated on `DATABASE_URL`, same as
 * every other database-backed test in this monorepo.
 */
export function hasTestDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function createTestRepositories(): { sql: postgres.Sql; repositories: Repositories } {
  const sql = postgres(process.env.DATABASE_URL as string, { max: 1, onnotice: () => {} });
  const db = drizzle(sql, { schema });
  return { sql, repositories: createRepositories(db) };
}

/** Clears every domain table between tests, in FK-safe order. */
export async function resetTestTables(sql: postgres.Sql): Promise<void> {
  await sql`TRUNCATE TABLE memberships, agencies, users RESTART IDENTITY CASCADE`;
}
