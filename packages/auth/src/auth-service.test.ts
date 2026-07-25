import { describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@reviewflow/errors";
import type { UserRepository } from "@reviewflow/database";
import type { SupabaseClient } from "@reviewflow/supabase";
import { createAuthService } from "./auth-service";

const IDENTITY_ID = "11111111-1111-1111-1111-111111111111";

function mockUser(
  overrides: Partial<{ id: string; email: string; user_metadata: Record<string, unknown> }> = {},
) {
  return { id: IDENTITY_ID, email: "person@example.com", user_metadata: {}, ...overrides };
}

function mockSession(overrides: Partial<{ expires_at: number }> = {}) {
  return {
    access_token: "redacted",
    refresh_token: "redacted",
    expires_at: 9999999999,
    ...overrides,
  };
}

function createMockSupabase(): SupabaseClient {
  return {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- only the `.auth` surface is used by this package
  } as any;
}

function createMockUsers(): UserRepository {
  return {
    findByAuthUserId: vi.fn(),
    findByEmail: vi.fn(),
    linkAuthUserId: vi.fn(),
    create: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- only the methods auth-service.ts calls are used
  } as any;
}

const APP_USER = {
  id: "app-user-1",
  email: "person@example.com",
  fullName: "person@example.com",
  avatarUrl: null,
  authUserId: IDENTITY_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("createAuthService", () => {
  describe("signUp", () => {
    it("wraps a successful sign-up (with session) into user + session", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser(), session: mockSession() },
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);
      vi.mocked(users.findByAuthUserId).mockResolvedValue(undefined);
      vi.mocked(users.findByEmail).mockResolvedValue(undefined);
      vi.mocked(users.create).mockResolvedValue(APP_USER);

      const service = createAuthService({ supabase, users });
      const result = await service.signUp({
        email: "person@example.com",
        password: "hunter2hunter2",
      });

      expect(result.user).toEqual(APP_USER);
      expect(result.session?.identity.id).toBe(IDENTITY_ID);
      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: "person@example.com", authUserId: IDENTITY_ID }),
      );
    });

    it("normalizes the email before calling Supabase (never compares/sends raw email strings)", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser(), session: mockSession() },
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);
      vi.mocked(users.findByAuthUserId).mockResolvedValue(undefined);
      vi.mocked(users.findByEmail).mockResolvedValue(undefined);
      vi.mocked(users.create).mockResolvedValue(APP_USER);

      const service = createAuthService({ supabase, users });
      await service.signUp({ email: " Person@Example.COM ", password: "hunter2hunter2" });

      expect(supabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({ email: "person@example.com" }),
      );
    });

    it("returns a null session when email confirmation is pending", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser(), session: null },
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);
      vi.mocked(users.findByAuthUserId).mockResolvedValue(undefined);
      vi.mocked(users.findByEmail).mockResolvedValue(undefined);
      vi.mocked(users.create).mockResolvedValue(APP_USER);

      const service = createAuthService({ supabase, users });
      const result = await service.signUp({
        email: "person@example.com",
        password: "hunter2hunter2",
      });

      expect(result.session).toBeNull();
      expect(result.user).toEqual(APP_USER);
    });

    it("throws AuthenticationError when sign-up fails", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Email already registered", code: "user_already_exists" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);

      const service = createAuthService({ supabase, users });

      await expect(
        service.signUp({ email: "person@example.com", password: "hunter2hunter2" }),
      ).rejects.toBeInstanceOf(AuthenticationError);
      expect(users.create).not.toHaveBeenCalled();
    });
  });

  describe("signIn", () => {
    it("wraps a successful sign-in into user + session", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser(), session: mockSession() },
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);
      vi.mocked(users.findByAuthUserId).mockResolvedValue(APP_USER);

      const service = createAuthService({ supabase, users });
      const result = await service.signIn({
        email: "person@example.com",
        password: "hunter2hunter2",
      });

      expect(result.user).toEqual(APP_USER);
      expect(result.session?.expiresAt).toBe(9999999999);
    });

    it("normalizes the email before calling Supabase (never compares/sends raw email strings)", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser(), session: mockSession() },
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);
      vi.mocked(users.findByAuthUserId).mockResolvedValue(APP_USER);

      const service = createAuthService({ supabase, users });
      await service.signIn({ email: "  Person@Example.com ", password: "hunter2hunter2" });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(
        expect.objectContaining({ email: "person@example.com" }),
      );
    });

    it("never reveals whether the email is registered — always the same generic message", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials", code: "invalid_credentials" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);

      const service = createAuthService({ supabase, users });

      await expect(
        service.signIn({ email: "nonexistent@example.com", password: "wrong" }),
      ).rejects.toMatchObject({ message: "Invalid email or password." });
    });

    it("does not create a duplicate application user across repeated sign-ins (duplicate login)", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser(), session: mockSession() },
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);
      // First call: not linked yet, not found by email either -> creates.
      // Second call: now found by auth_user_id -> no create.
      vi.mocked(users.findByAuthUserId)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(APP_USER);
      vi.mocked(users.findByEmail).mockResolvedValue(undefined);
      vi.mocked(users.create).mockResolvedValue(APP_USER);

      const service = createAuthService({ supabase, users });
      await service.signIn({ email: "person@example.com", password: "hunter2hunter2" });
      await service.signIn({ email: "person@example.com", password: "hunter2hunter2" });

      expect(users.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("signOut", () => {
    it("resolves when Supabase sign-out succeeds", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      await expect(createAuthService({ supabase, users }).signOut()).resolves.toBeUndefined();
    });

    it("throws AuthenticationError when Supabase sign-out fails", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: { message: "network error" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);

      await expect(createAuthService({ supabase, users }).signOut()).rejects.toBeInstanceOf(
        AuthenticationError,
      );
    });
  });

  describe("refreshSession", () => {
    it("returns the refreshed session on success", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({ data: {}, error: null } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser() },
        error: null,
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession() },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);

      const session = await createAuthService({ supabase, users }).refreshSession();

      expect(session?.identity.id).toBe(IDENTITY_ID);
    });

    it("returns null without throwing when the refresh itself fails", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: {},
        error: { message: "refresh token expired", code: "refresh_token_expired" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);

      const session = await createAuthService({ supabase, users }).refreshSession();

      expect(session).toBeNull();
    });
  });

  describe("getCurrentSession", () => {
    it("returns null and never touches the database when there is no session", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: "not authenticated" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);

      const session = await createAuthService({ supabase, users }).getCurrentSession();

      expect(session).toBeNull();
      expect(users.findByAuthUserId).not.toHaveBeenCalled();
      expect(users.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("returns null and never touches the database when there is no session (skip database lookup)", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: "not authenticated" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);

      const user = await createAuthService({ supabase, users }).getCurrentUser();

      expect(user).toBeNull();
      expect(users.findByAuthUserId).not.toHaveBeenCalled();
    });

    it("syncs and returns the application user when a valid session exists", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser() },
        error: null,
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession() },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);
      vi.mocked(users.findByAuthUserId).mockResolvedValue(APP_USER);

      const user = await createAuthService({ supabase, users }).getCurrentUser();

      expect(user).toEqual(APP_USER);
    });
  });

  describe("syncUser", () => {
    it("returns the existing user when already linked by auth_user_id", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(users.findByAuthUserId).mockResolvedValue(APP_USER);

      const user = await createAuthService({ supabase, users }).syncUser({
        id: IDENTITY_ID,
        email: "person@example.com",
      });

      expect(user).toEqual(APP_USER);
      expect(users.findByEmail).not.toHaveBeenCalled();
      expect(users.create).not.toHaveBeenCalled();
    });

    it("links auth_user_id when an application user is found by email, without touching other fields", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      const existing = { ...APP_USER, authUserId: null, fullName: "Existing Name" };
      vi.mocked(users.findByAuthUserId).mockResolvedValue(undefined);
      vi.mocked(users.findByEmail).mockResolvedValue(existing);
      vi.mocked(users.linkAuthUserId).mockResolvedValue({ ...existing, authUserId: IDENTITY_ID });

      const user = await createAuthService({ supabase, users }).syncUser({
        id: IDENTITY_ID,
        email: "person@example.com",
        fullName: "Ignored New Name",
      });

      expect(users.linkAuthUserId).toHaveBeenCalledWith(existing.id, IDENTITY_ID);
      expect(users.create).not.toHaveBeenCalled();
      expect(user.fullName).toBe("Existing Name");
    });

    it("creates a new application user, populating email/full_name/avatar_url, when none exists", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(users.findByAuthUserId).mockResolvedValue(undefined);
      vi.mocked(users.findByEmail).mockResolvedValue(undefined);
      vi.mocked(users.create).mockResolvedValue(APP_USER);

      await createAuthService({ supabase, users }).syncUser({
        id: IDENTITY_ID,
        email: "person@example.com",
        fullName: "Person One",
        avatarUrl: "https://example.com/avatar.png",
      });

      expect(users.create).toHaveBeenCalledWith({
        email: "person@example.com",
        fullName: "Person One",
        avatarUrl: "https://example.com/avatar.png",
        authUserId: IDENTITY_ID,
      });
    });

    it("falls back to the email as full_name when the identity has no name", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(users.findByAuthUserId).mockResolvedValue(undefined);
      vi.mocked(users.findByEmail).mockResolvedValue(undefined);
      vi.mocked(users.create).mockResolvedValue(APP_USER);

      await createAuthService({ supabase, users }).syncUser({
        id: IDENTITY_ID,
        email: "person@example.com",
      });

      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: "person@example.com", avatarUrl: null }),
      );
    });
  });

  describe("requestPasswordReset", () => {
    it("normalizes the email and calls Supabase's reset endpoint", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null });

      await createAuthService({ supabase, users }).requestPasswordReset("  Person@Example.COM ");

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("person@example.com");
    });

    it("never throws, even when Supabase reports an error (no user enumeration)", async () => {
      const supabase = createMockSupabase();
      const users = createMockUsers();
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: { message: "User not found", code: "user_not_found" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial Supabase response shape
      } as any);

      await expect(
        createAuthService({ supabase, users }).requestPasswordReset("nobody@example.com"),
      ).resolves.toBeUndefined();
    });
  });
});
