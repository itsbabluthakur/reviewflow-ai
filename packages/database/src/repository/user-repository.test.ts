import postgres from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "../client";
import { UserRepository } from "./user-repository";
import { AgencyRepository } from "./agency-repository";
import { MembershipRepository } from "./membership-repository";
import { createTestDb, hasTestDatabase, resetTestTables } from "./test-db";

describe.skipIf(!hasTestDatabase())("UserRepository", () => {
  let sql: postgres.Sql;
  let db: Database;
  let userRepo: UserRepository;
  let agencyRepo: AgencyRepository;
  let membershipRepo: MembershipRepository;

  beforeAll(() => {
    ({ sql, db } = createTestDb());
    userRepo = new UserRepository(db);
    agencyRepo = new AgencyRepository(db);
    membershipRepo = new MembershipRepository(db);
  });

  afterEach(async () => {
    await resetTestTables(sql);
  });

  afterAll(async () => {
    await sql.end();
  });

  it("findByEmail returns the matching user", async () => {
    const created = await userRepo.create({ email: "a@example.com", fullName: "A" });

    const found = await userRepo.findByEmail("a@example.com");

    expect(found?.id).toBe(created.id);
    expect(found?.fullName).toBe("A");
  });

  it("findByEmail returns undefined when no user matches", async () => {
    const found = await userRepo.findByEmail("missing@example.com");

    expect(found).toBeUndefined();
  });

  it("findUserAgencies returns agencies the user has a membership in", async () => {
    const user = await userRepo.create({ email: "b@example.com", fullName: "B" });
    const agency = await agencyRepo.create({ name: "Acme", slug: "acme", timezone: "UTC" });
    await membershipRepo.create({ agencyId: agency.id, userId: user.id, role: "owner" });

    const result = await userRepo.findUserAgencies(user.id);

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("acme");
  });
});
