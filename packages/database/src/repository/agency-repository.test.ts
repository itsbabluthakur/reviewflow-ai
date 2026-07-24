import postgres from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "../client";
import { AgencyRepository } from "./agency-repository";
import { UserRepository } from "./user-repository";
import { MembershipRepository } from "./membership-repository";
import { createTestDb, hasTestDatabase, resetTestTables } from "./test-db";

describe.skipIf(!hasTestDatabase())("AgencyRepository", () => {
  let sql: postgres.Sql;
  let db: Database;
  let agencyRepo: AgencyRepository;
  let userRepo: UserRepository;
  let membershipRepo: MembershipRepository;

  beforeAll(() => {
    ({ sql, db } = createTestDb());
    agencyRepo = new AgencyRepository(db);
    userRepo = new UserRepository(db);
    membershipRepo = new MembershipRepository(db);
  });

  afterEach(async () => {
    await resetTestTables(sql);
  });

  afterAll(async () => {
    await sql.end();
  });

  it("findBySlug returns the matching agency", async () => {
    const created = await agencyRepo.create({ name: "Acme", slug: "acme", timezone: "UTC" });

    const found = await agencyRepo.findBySlug("acme");

    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe("Acme");
  });

  it("findBySlug returns undefined when no agency matches", async () => {
    const found = await agencyRepo.findBySlug("missing");

    expect(found).toBeUndefined();
  });

  it("findMembers returns users who belong to the agency via a membership", async () => {
    const agency = await agencyRepo.create({ name: "Acme", slug: "acme", timezone: "UTC" });
    const user = await userRepo.create({ email: "c@example.com", fullName: "C" });
    await membershipRepo.create({ agencyId: agency.id, userId: user.id, role: "member" });

    const members = await agencyRepo.findMembers(agency.id);

    expect(members).toHaveLength(1);
    expect(members[0]?.email).toBe("c@example.com");
    expect(members[0]?.role).toBe("member");
  });
});
