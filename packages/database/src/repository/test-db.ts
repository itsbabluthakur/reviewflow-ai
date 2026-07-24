import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema";
import type { Database } from "../client";

/**
 * Repository/seed tests need a real Postgres instance (Drizzle's relational
 * query API and unique-constraint behavior aren't meaningfully mockable).
 * Gated on `DATABASE_URL` so `pnpm test` still passes with `passWithNoTests`
 * in environments (default CI) that don't provision a database — see
 * packages/database/README.md.
 */
export function hasTestDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function createTestDb(): { sql: postgres.Sql; db: Database } {
  const sql = postgres(process.env.DATABASE_URL as string, { max: 1, onnotice: () => {} });
  const db = drizzle(sql, { schema });
  return { sql, db };
}

/** Clears every domain table between tests, in FK-safe order. */
export async function resetTestTables(sql: postgres.Sql): Promise<void> {
  await sql`TRUNCATE TABLE memberships, agencies, users RESTART IDENTITY CASCADE`;
}
