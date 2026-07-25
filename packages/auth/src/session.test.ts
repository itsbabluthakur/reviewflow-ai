import postgres from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { AuthenticationError, AuthorizationError } from "@reviewflow/errors";
import type { Repositories } from "@reviewflow/database";
import type { AuthService } from "./auth-service";
import {
  optionalSession,
  optionalUser,
  requireMembership,
  requireSession,
  requireUser,
} from "./session";
import { createTestRepositories, hasTestDatabase, resetTestTables } from "./test-db";

const SESSION = { identity: { id: "auth-1", email: "person@example.com" }, expiresAt: 9999999999 };
const APP_USER = {
  id: "user-1",
  email: "person@example.com",
  fullName: "Person",
  avatarUrl: null,
  authUserId: "auth-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function fakeAuthService(overrides: Partial<AuthService> = {}): AuthService {
  return {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    getCurrentSession: vi.fn().mockResolvedValue(null),
    getCurrentUser: vi.fn().mockResolvedValue(null),
    syncUser: vi.fn(),
    requestPasswordReset: vi.fn(),
    ...overrides,
  };
}

describe("optionalSession / requireSession", () => {
  it("optionalSession returns null without throwing when there is no session", async () => {
    const authService = fakeAuthService();
    await expect(optionalSession(authService)).resolves.toBeNull();
  });

  it("optionalSession returns the session when one exists", async () => {
    const authService = fakeAuthService({ getCurrentSession: vi.fn().mockResolvedValue(SESSION) });
    await expect(optionalSession(authService)).resolves.toEqual(SESSION);
  });

  it("requireSession throws AuthenticationError when there is no session", async () => {
    const authService = fakeAuthService();
    await expect(requireSession(authService)).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("requireSession returns the session when one exists", async () => {
    const authService = fakeAuthService({ getCurrentSession: vi.fn().mockResolvedValue(SESSION) });
    await expect(requireSession(authService)).resolves.toEqual(SESSION);
  });
});

describe("optionalUser / requireUser", () => {
  it("optionalUser returns null without throwing when unauthenticated", async () => {
    const authService = fakeAuthService();
    await expect(optionalUser(authService)).resolves.toBeNull();
  });

  it("requireUser throws AuthenticationError when unauthenticated", async () => {
    const authService = fakeAuthService();
    await expect(requireUser(authService)).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("requireUser returns the synced application user when authenticated", async () => {
    const authService = fakeAuthService({ getCurrentUser: vi.fn().mockResolvedValue(APP_USER) });
    await expect(requireUser(authService)).resolves.toEqual(APP_USER);
  });
});

describe.skipIf(!hasTestDatabase())("requireMembership", () => {
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

  it("throws AuthorizationError when the user has no membership in the agency (missing membership)", async () => {
    const user = await repositories.users.create({
      email: "no-membership@example.com",
      fullName: "N",
    });
    const agency = await repositories.agencies.create({
      name: "Acme",
      slug: "acme",
      timezone: "UTC",
    });
    const authService = fakeAuthService({ getCurrentUser: vi.fn().mockResolvedValue(user) });

    await expect(
      requireMembership(authService, repositories.memberships, agency.id),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("resolves the user and membership when a membership exists, without checking the role", async () => {
    const user = await repositories.users.create({ email: "member@example.com", fullName: "M" });
    const agency = await repositories.agencies.create({
      name: "Acme",
      slug: "acme",
      timezone: "UTC",
    });
    const membership = await repositories.memberships.create({
      agencyId: agency.id,
      userId: user.id,
      role: "member",
    });
    const authService = fakeAuthService({ getCurrentUser: vi.fn().mockResolvedValue(user) });

    const context = await requireMembership(authService, repositories.memberships, agency.id);

    expect(context.user.id).toBe(user.id);
    expect(context.membership.id).toBe(membership.id);
  });

  it("throws AuthenticationError before checking membership when there is no authenticated user", async () => {
    const agency = await repositories.agencies.create({
      name: "Acme",
      slug: "acme",
      timezone: "UTC",
    });
    const authService = fakeAuthService();

    await expect(
      requireMembership(authService, repositories.memberships, agency.id),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });
});
