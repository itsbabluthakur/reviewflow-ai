import postgres from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { DatabaseError } from "@reviewflow/errors";
import type { Database } from "../client";
import { AgencyRepository } from "./agency-repository";
import { MembershipRepository } from "./membership-repository";
import { UserRepository } from "./user-repository";
import { createTestDb, hasTestDatabase, resetTestTables } from "./test-db";

describe.skipIf(!hasTestDatabase())("MembershipRepository", () => {
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

  it("findByAgencyAndUser returns the matching membership", async () => {
    const agency = await agencyRepo.create({ name: "Acme", slug: "acme", timezone: "UTC" });
    const user = await userRepo.create({ email: "d@example.com", fullName: "D" });
    const created = await membershipRepo.create({
      agencyId: agency.id,
      userId: user.id,
      role: "owner",
    });

    const found = await membershipRepo.findByAgencyAndUser(agency.id, user.id);

    expect(found?.id).toBe(created.id);
  });

  it("rejects a second membership for the same agency and user pair", async () => {
    const agency = await agencyRepo.create({ name: "Acme", slug: "acme", timezone: "UTC" });
    const user = await userRepo.create({ email: "e@example.com", fullName: "E" });
    await membershipRepo.create({ agencyId: agency.id, userId: user.id, role: "owner" });

    await expect(
      membershipRepo.create({ agencyId: agency.id, userId: user.id, role: "member" }),
    ).rejects.toBeInstanceOf(DatabaseError);
  });

  it("allows the same user to belong to two different agencies", async () => {
    const agencyOne = await agencyRepo.create({ name: "Acme", slug: "acme", timezone: "UTC" });
    const agencyTwo = await agencyRepo.create({ name: "Globex", slug: "globex", timezone: "UTC" });
    const user = await userRepo.create({ email: "f@example.com", fullName: "F" });

    await membershipRepo.create({ agencyId: agencyOne.id, userId: user.id, role: "owner" });
    await expect(
      membershipRepo.create({ agencyId: agencyTwo.id, userId: user.id, role: "owner" }),
    ).resolves.toBeDefined();
  });
});
