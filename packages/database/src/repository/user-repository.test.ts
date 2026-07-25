import postgres from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { DatabaseError } from "@reviewflow/errors";
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

  it("create normalizes email before storing it, so it is found regardless of the casing/whitespace used later", async () => {
    const created = await userRepo.create({ email: "  Case@Example.com ", fullName: "Case" });

    expect(created.email).toBe("case@example.com");
    expect((await userRepo.findByEmail("CASE@example.com"))?.id).toBe(created.id);
  });

  it("duplicate detection: rejects a second user with only a different case/whitespace variant of an existing email", async () => {
    await userRepo.create({ email: "dup@example.com", fullName: "First" });

    await expect(
      userRepo.create({ email: " DUP@Example.com ", fullName: "Second" }),
    ).rejects.toBeInstanceOf(DatabaseError);
  });

  it("findByEmail returns undefined when no user matches", async () => {
    const found = await userRepo.findByEmail("missing@example.com");

    expect(found).toBeUndefined();
  });

  it("findByEmail normalizes case and whitespace before searching", async () => {
    const created = await userRepo.create({ email: "mixed@example.com", fullName: "Mixed" });

    expect((await userRepo.findByEmail("MIXED@example.com"))?.id).toBe(created.id);
    expect((await userRepo.findByEmail(" mixed@example.com "))?.id).toBe(created.id);
    expect((await userRepo.findByEmail("Mixed@Example.com"))?.id).toBe(created.id);
  });

  it("findUserAgencies returns agencies the user has a membership in", async () => {
    const user = await userRepo.create({ email: "b@example.com", fullName: "B" });
    const agency = await agencyRepo.create({ name: "Acme", slug: "acme", timezone: "UTC" });
    await membershipRepo.create({ agencyId: agency.id, userId: user.id, role: "owner" });

    const result = await userRepo.findUserAgencies(user.id);

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("acme");
  });

  it("findByAuthUserId returns the user linked to that Supabase identity", async () => {
    const created = await userRepo.create({
      email: "g@example.com",
      fullName: "G",
      authUserId: "11111111-1111-1111-1111-111111111111",
    });

    const found = await userRepo.findByAuthUserId("11111111-1111-1111-1111-111111111111");

    expect(found?.id).toBe(created.id);
  });

  it("findByAuthUserId returns undefined when no user is linked", async () => {
    const found = await userRepo.findByAuthUserId("22222222-2222-2222-2222-222222222222");

    expect(found).toBeUndefined();
  });

  it("linkAuthUserId sets auth_user_id without touching other columns", async () => {
    const created = await userRepo.create({ email: "h@example.com", fullName: "H" });

    const linked = await userRepo.linkAuthUserId(
      created.id,
      "33333333-3333-3333-3333-333333333333",
    );

    expect(linked?.authUserId).toBe("33333333-3333-3333-3333-333333333333");
    expect(linked?.fullName).toBe("H");
  });
});
