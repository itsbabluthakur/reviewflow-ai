import path from "node:path";
import { pathToFileURL } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { createLogger } from "@reviewflow/logger";
import { loadDatabaseEnv } from "./env";
import { agencies, memberships, users } from "./schema";

const logger = createLogger({ module: "database:seed" });

export const DEMO_AGENCY = {
  name: "ReviewFlow Demo",
  slug: "demo",
  timezone: "UTC",
} as const;

export const DEMO_USER = {
  email: "admin@example.com",
  fullName: "Administrator",
} as const;

type Db = ReturnType<
  typeof drizzle<{
    agencies: typeof agencies;
    users: typeof users;
    memberships: typeof memberships;
  }>
>;

/** Inserts the demo agency if absent, returning the existing or newly created row either way. */
export async function upsertDemoAgency(db: Db) {
  const inserted = await db
    .insert(agencies)
    .values(DEMO_AGENCY)
    .onConflictDoNothing({ target: agencies.slug })
    .returning();
  if (inserted[0]) {
    return inserted[0];
  }
  const [existing] = await db
    .select()
    .from(agencies)
    .where(eq(agencies.slug, DEMO_AGENCY.slug))
    .limit(1);
  if (!existing) {
    throw new Error("Failed to seed or locate the demo agency.");
  }
  return existing;
}

/** Inserts the demo user if absent, returning the existing or newly created row either way. */
export async function upsertDemoUser(db: Db) {
  const inserted = await db
    .insert(users)
    .values(DEMO_USER)
    .onConflictDoNothing({ target: users.email })
    .returning();
  if (inserted[0]) {
    return inserted[0];
  }
  const [existing] = await db.select().from(users).where(eq(users.email, DEMO_USER.email)).limit(1);
  if (!existing) {
    throw new Error("Failed to seed or locate the demo user.");
  }
  return existing;
}

export async function main(): Promise<void> {
  const env = loadDatabaseEnv();
  const sql = postgres(env.DATABASE_URL, { max: 1, onnotice: () => {} });
  const db = drizzle(sql, { schema: { agencies, users, memberships } });

  try {
    const agency = await upsertDemoAgency(db);
    const user = await upsertDemoUser(db);

    await db
      .insert(memberships)
      .values({ agencyId: agency.id, userId: user.id, role: "owner" })
      .onConflictDoNothing({ target: [memberships.agencyId, memberships.userId] });

    logger.info(
      { agency: agency.slug, user: user.email },
      "seed complete (agency, user, membership)",
    );
  } finally {
    await sql.end();
  }
}

// Only auto-run when executed directly (`tsx src/seed.ts`, the `db:seed`
// script) — not when imported by tests, which exercise upsertDemoAgency/
// upsertDemoUser/main against their own test connection.
const isMainModule =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMainModule) {
  main().catch((error: unknown) => {
    logger.error({ err: error }, "seed failed");
    process.exitCode = 1;
  });
}
