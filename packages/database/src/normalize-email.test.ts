import { describe, expect, it } from "vitest";
import { ValidationError } from "@reviewflow/errors";
import { normalizeEmail } from "./normalize-email";

describe("normalizeEmail", () => {
  it("lowercases mixed-case addresses", () => {
    expect(normalizeEmail("JOHN@example.com")).toBe("john@example.com");
  });

  it("trims leading whitespace", () => {
    expect(normalizeEmail("  john@example.com")).toBe("john@example.com");
  });

  it("trims trailing whitespace", () => {
    expect(normalizeEmail("john@example.com  ")).toBe("john@example.com");
  });

  it("resolves mixed case and surrounding whitespace to the same canonical value", () => {
    const canonical = "john@example.com";
    expect(normalizeEmail("John@example.com")).toBe(canonical);
    expect(normalizeEmail(" john@example.com ")).toBe(canonical);
    expect(normalizeEmail("JOHN@example.com")).toBe(canonical);
  });

  it("rejects an empty string", () => {
    expect(() => normalizeEmail("")).toThrow(ValidationError);
  });

  it("rejects a whitespace-only string", () => {
    expect(() => normalizeEmail("   ")).toThrow(ValidationError);
  });
});
