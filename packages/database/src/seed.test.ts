import postgres from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { DEMO_AGENCY, DEMO_USER, main } from "./seed";
import { hasTestDatabase, resetTestTables } from "./repository/test-db";

describe.skipIf(!hasTestDatabase())("seed idempotency", () => {
  let sql: postgres.Sql;

  beforeAll(() => {
    sql = postgres(process.env.DATABASE_URL as string, { max: 1, onnotice: () => {} });
  });

  afterEach(async () => {
    await resetTestTables(sql);
  });

  afterAll(async () => {
    await sql.end();
  });

  it("running the seed twice leaves exactly one agency, user, and membership", async () => {
    await main();
    await main();

    const [agencyRows, userRows, membershipRows] = await Promise.all([
      sql`select id from agencies where slug = ${DEMO_AGENCY.slug}`,
      sql`select id from users where email = ${DEMO_USER.email}`,
      sql`select id from memberships`,
    ]);

    expect(agencyRows).toHaveLength(1);
    expect(userRows).toHaveLength(1);
    expect(membershipRows).toHaveLength(1);
  });
});
