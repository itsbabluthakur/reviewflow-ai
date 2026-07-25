import postgres from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Repositories } from "@reviewflow/database";
import type { SupabaseClient } from "@reviewflow/supabase";
import { createAuthService } from "./auth-service";
import { createTestRepositories, hasTestDatabase, resetTestTables } from "./test-db";

// syncUser never calls Supabase — this stub only exists to satisfy createAuthService's deps.
const stubSupabase = {} as SupabaseClient;

describe.skipIf(!hasTestDatabase())("syncUser (real database)", () => {
  let sql: postgres.Sql;
  let repositories: Repositories;

  beforeAll(() => {
    ({ sql, repositories } = createTestRepositories());
  });

  afterEach(async () => {
    await resetTestTables(sql);
  });

  afterAll(async () => {
    await sql.end();
  });

  it("creates a new application user, populating email/full_name/avatar_url", async () => {
    const service = createAuthService({ supabase: stubSupabase, users: repositories.users });

    const user = await service.syncUser({
      id: "11111111-1111-1111-1111-111111111111",
      email: "new@example.com",
      fullName: "New Person",
      avatarUrl: "https://example.com/a.png",
    });

    expect(user.email).toBe("new@example.com");
    expect(user.fullName).toBe("New Person");
    expect(user.avatarUrl).toBe("https://example.com/a.png");
    expect(user.authUserId).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("normalizes a mixed-case/whitespace email before storing it", async () => {
    const service = createAuthService({ supabase: stubSupabase, users: repositories.users });

    const user = await service.syncUser({
      id: "44444444-4444-4444-4444-444444444444",
      email: "  Mixed.Case@Example.com ",
      fullName: "Mixed Case",
    });

    expect(user.email).toBe("mixed.case@example.com");
  });

  it("canonical lookup: finds an existing user by email regardless of case/whitespace differences", async () => {
    const preExisting = await repositories.users.create({
      email: "canonical@example.com",
      fullName: "Canonical",
    });

    const service = createAuthService({ supabase: stubSupabase, users: repositories.users });
    const linked = await service.syncUser({
      id: "55555555-5555-5555-5555-555555555555",
      email: " Canonical@Example.COM ",
      fullName: "Should Not Overwrite",
    });

    expect(linked.id).toBe(preExisting.id);
    expect(linked.fullName).toBe("Canonical");
    const all = await sql`select id from users where email = ${"canonical@example.com"}`;
    expect(all).toHaveLength(1);
  });

  it("duplicate login: syncing the same identity twice never creates a second row", async () => {
    const service = createAuthService({ supabase: stubSupabase, users: repositories.users });
    const identity = { id: "22222222-2222-2222-2222-222222222222", email: "repeat@example.com" };

    const first = await service.syncUser(identity);
    const second = await service.syncUser(identity);

    expect(second.id).toBe(first.id);
    const all = await sql`select id from users where email = ${identity.email}`;
    expect(all).toHaveLength(1);
  });

  it("links auth_user_id onto a pre-existing user found by email, preserving their existing name", async () => {
    const preExisting = await repositories.users.create({
      email: "already-there@example.com",
      fullName: "Original Name",
    });
    expect(preExisting.authUserId).toBeNull();

    const service = createAuthService({ supabase: stubSupabase, users: repositories.users });
    const linked = await service.syncUser({
      id: "33333333-3333-3333-3333-333333333333",
      email: "already-there@example.com",
      fullName: "Identity Claims A Different Name",
    });

    expect(linked.id).toBe(preExisting.id);
    expect(linked.fullName).toBe("Original Name");
    expect(linked.authUserId).toBe("33333333-3333-3333-3333-333333333333");

    const all = await sql`select id from users where email = ${"already-there@example.com"}`;
    expect(all).toHaveLength(1);
  });
});
