import { describe, expect, it, vi } from "vitest";

const signOutMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("./auth-context", () => ({
  getAuthContext: vi.fn().mockResolvedValue({ authService: { signOut: signOutMock } }),
}));

const { signOutAction } = await import("./sign-out-action");

describe("signOutAction", () => {
  it("calls packages/auth's signOut and redirects to /", async () => {
    await signOutAction();

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
