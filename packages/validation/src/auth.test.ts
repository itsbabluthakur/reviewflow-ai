import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, loginSchema, signupSchema } from "./auth";

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    expect(
      loginSchema.safeParse({ email: "a@example.com", password: "hunter2hunter2" }).success,
    ).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "hunter2hunter2" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  const valid = {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    password: "hunter2hunter2",
    confirmPassword: "hunter2hunter2",
  };

  it("accepts valid, matching input", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty full name", () => {
    const result = signupSchema.safeParse({ ...valid, fullName: "  " });
    expect(result.success).toBe(false);
  });

  it("accepts a password exactly 12 characters long", () => {
    const result = signupSchema.safeParse({
      ...valid,
      password: "twelvecharsX",
      confirmPassword: "twelvecharsX",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password shorter than 12 characters", () => {
    const result = signupSchema.safeParse({
      ...valid,
      password: "short12345",
      confirmPassword: "short12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords, attaching the error to confirmPassword", () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: "somethingElse123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});
