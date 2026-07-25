import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@reviewflow/errors";

const signInMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("../../lib/auth-context", () => ({
  getAuthContext: vi.fn().mockResolvedValue({ authService: { signIn: signInMock } }),
}));

const { loginAction } = await import("./actions");

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns field errors and never calls signIn/redirect for an invalid email", async () => {
    const result = await loginAction(
      "/dashboard",
      { status: "idle" },
      formData({ email: "not-an-email", password: "hunter2hunter2" }),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.email).toBeDefined();
    expect(signInMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to the given redirectTo on success", async () => {
    signInMock.mockResolvedValueOnce(undefined);

    await loginAction(
      "/settings",
      { status: "idle" },
      formData({ email: "person@example.com", password: "hunter2hunter2" }),
    );

    expect(redirectMock).toHaveBeenCalledWith("/settings");
  });

  it("falls back to /dashboard when redirectTo is an unsafe (open-redirect) target", async () => {
    signInMock.mockResolvedValueOnce(undefined);

    await loginAction(
      "https://evil.example",
      { status: "idle" },
      formData({ email: "person@example.com", password: "hunter2hunter2" }),
    );

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("shows a generic message for AuthenticationError, never the underlying cause", async () => {
    signInMock.mockRejectedValueOnce(new AuthenticationError("Invalid email or password."));

    const result = await loginAction(
      "/dashboard",
      { status: "idle" },
      formData({ email: "person@example.com", password: "wrongpassword" }),
    );

    expect(result).toEqual({ status: "error", message: "Invalid email or password." });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("shows a generic message for an unexpected (non-auth) failure, without leaking details", async () => {
    signInMock.mockRejectedValueOnce(new Error("connection refused: pg pool exhausted"));

    const result = await loginAction(
      "/dashboard",
      { status: "idle" },
      formData({ email: "person@example.com", password: "hunter2hunter2" }),
    );

    expect(result).toEqual({ status: "error", message: "Something went wrong. Please try again." });
  });
});
