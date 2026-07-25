import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@reviewflow/errors";

const signUpMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("../../lib/auth-context", () => ({
  getAuthContext: vi.fn().mockResolvedValue({ authService: { signUp: signUpMock } }),
}));

const { signupAction } = await import("./actions");

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

const VALID_FIELDS = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  password: "hunter2hunter2",
  confirmPassword: "hunter2hunter2",
};

describe("signupAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a confirmPassword field error and never calls signUp for mismatched passwords", async () => {
    const result = await signupAction(
      { status: "idle" },
      formData({ ...VALID_FIELDS, confirmPassword: "somethingElse123" }),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.confirmPassword).toBe("Passwords do not match.");
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("returns a password field error for a password shorter than 12 characters", async () => {
    const result = await signupAction(
      { status: "idle" },
      formData({ ...VALID_FIELDS, password: "short12345", confirmPassword: "short12345" }),
    );

    expect(result.fieldErrors?.password).toBeDefined();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("creates the account, syncs the user, and redirects to /dashboard on success", async () => {
    signUpMock.mockResolvedValueOnce(undefined);

    await signupAction({ status: "idle" }, formData(VALID_FIELDS));

    expect(signUpMock).toHaveBeenCalledWith({
      fullName: VALID_FIELDS.fullName,
      email: VALID_FIELDS.email,
      password: VALID_FIELDS.password,
    });
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("surfaces the AuthenticationError message without redirecting on failure", async () => {
    signUpMock.mockRejectedValueOnce(
      new AuthenticationError("Could not create an account with the details provided."),
    );

    const result = await signupAction({ status: "idle" }, formData(VALID_FIELDS));

    expect(result).toEqual({
      status: "error",
      message: "Could not create an account with the details provided.",
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("shows a generic message for an unexpected (non-auth) failure", async () => {
    signUpMock.mockRejectedValueOnce(new Error("connection refused"));

    const result = await signupAction({ status: "idle" }, formData(VALID_FIELDS));

    expect(result).toEqual({ status: "error", message: "Something went wrong. Please try again." });
  });
});
