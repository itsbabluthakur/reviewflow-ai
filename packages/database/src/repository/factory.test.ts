import postgres from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "../client";
import { createRepositories } from "./factory";
import { UserRepository } from "./user-repository";
import { AgencyRepository } from "./agency-repository";
import { MembershipRepository } from "./membership-repository";
import { withTransaction } from "./transaction";
import { createTestDb, hasTestDatabase, resetTestTables } from "./test-db";

describe.skipIf(!hasTestDatabase())("createRepositories", () => {
  let sql: postgres.Sql;
  let db: Database;

  beforeAll(() => {
    ({ sql, db } = createTestDb());
  });

  afterEach(async () => {
    await resetTestTables(sql);
  });

  afterAll(async () => {
    await sql.end();
  });

  it("exposes users, agencies, and memberships as the correct repository types", () => {
    const repos = createRepositories(db);
    expect(repos.users).toBeInstanceOf(UserRepository);
    expect(repos.agencies).toBeInstanceOf(AgencyRepository);
    expect(repos.memberships).toBeInstanceOf(MembershipRepository);
  });

  it("lazily constructs each repository once, reusing the same instance on repeat access", () => {
    const repos = createRepositories(db);
    expect(repos.users).toBe(repos.users);
    expect(repos.agencies).toBe(repos.agencies);
    expect(repos.memberships).toBe(repos.memberships);
  });

  it("shares one db instance, so repositories built from one call see each other's writes", async () => {
    const repos = createRepositories(db);
    const user = await repos.users.create({ email: "factory@example.com", fullName: "Factory" });
    const agency = await repos.agencies.create({
      name: "Factory Co",
      slug: "factory-co",
      timezone: "UTC",
    });
    await repos.memberships.create({ agencyId: agency.id, userId: user.id, role: "owner" });

    const found = await repos.memberships.findByAgencyAndUser(agency.id, user.id);
    expect(found).toBeDefined();
  });

  it("is transaction-friendly: repositories built from a transaction handle commit atomically", async () => {
    const created = await withTransaction(db, async (tx) => {
      const repos = createRepositories(tx);
      return repos.users.create({ email: "tx@example.com", fullName: "Tx" });
    });
    expect(created.email).toBe("tx@example.com");

    const persisted = await createRepositories(db).users.findByEmail("tx@example.com");
    expect(persisted?.id).toBe(created.id);
  });
});
