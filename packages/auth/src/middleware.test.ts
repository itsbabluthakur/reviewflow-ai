import { describe, expect, it } from "vitest";
import {
  isProtectedPath,
  isPublicPath,
  isSafeRedirectPath,
  resolveMiddlewareDecision,
} from "./middleware";

describe("isPublicPath / isProtectedPath", () => {
  it.each([
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/api/live",
    "/api/ready",
  ])("%s is public", (path) => {
    expect(isPublicPath(path)).toBe(true);
    expect(isProtectedPath(path)).toBe(false);
  });

  it.each(["/dashboard", "/settings", "/account", "/profile", "/api/private"])(
    "%s is protected",
    (path) => {
      expect(isProtectedPath(path)).toBe(true);
    },
  );

  it("treats nested paths under a protected prefix as protected", () => {
    expect(isProtectedPath("/dashboard/reviews")).toBe(true);
    expect(isProtectedPath("/api/private/me")).toBe(true);
  });

  it("does not treat an unrelated path sharing a prefix as protected", () => {
    expect(isProtectedPath("/dashboard-preview")).toBe(false);
  });
});

describe("resolveMiddlewareDecision", () => {
  it("allows an unprotected path with no session", () => {
    expect(resolveMiddlewareDecision({ pathname: "/", hasSession: false })).toEqual({
      action: "allow",
    });
  });

  it("allows a protected page path when a session exists", () => {
    expect(resolveMiddlewareDecision({ pathname: "/dashboard", hasSession: true })).toEqual({
      action: "allow",
    });
  });

  it("redirects an unauthenticated request to a protected page, preserving the path", () => {
    expect(resolveMiddlewareDecision({ pathname: "/dashboard", hasSession: false })).toEqual({
      action: "redirect",
      location: "/login?redirect=%2Fdashboard",
    });
  });

  it("preserves the query string in the redirect target", () => {
    expect(
      resolveMiddlewareDecision({
        pathname: "/settings",
        search: "?tab=billing",
        hasSession: false,
      }),
    ).toEqual({
      action: "redirect",
      location: "/login?redirect=%2Fsettings%3Ftab%3Dbilling",
    });
  });

  it("denies (no redirect) an unauthenticated request to a protected API path", () => {
    expect(resolveMiddlewareDecision({ pathname: "/api/private/me", hasSession: false })).toEqual({
      action: "deny",
    });
  });

  it("allows a protected API path when a session exists", () => {
    expect(resolveMiddlewareDecision({ pathname: "/api/private/me", hasSession: true })).toEqual({
      action: "allow",
    });
  });

  it("never redirects /login itself, even without a session (no redirect loop)", () => {
    expect(resolveMiddlewareDecision({ pathname: "/login", hasSession: false })).toEqual({
      action: "allow",
    });
  });

  it("never redirects any public path, even without a session", () => {
    for (const path of [
      "/",
      "/signup",
      "/forgot-password",
      "/reset-password",
      "/api/live",
      "/api/ready",
    ]) {
      expect(resolveMiddlewareDecision({ pathname: path, hasSession: false })).toEqual({
        action: "allow",
      });
    }
  });
});

describe("isSafeRedirectPath", () => {
  it.each(["/dashboard", "/settings", "/profile", "/dashboard?tab=overview"])(
    "accepts a relative path: %s",
    (path) => {
      expect(isSafeRedirectPath(path)).toBe(true);
    },
  );

  it.each([
    "https://evil.example",
    "http://evil.example/dashboard",
    "//evil.example",
    "/\\evil.example",
  ])("rejects a non-relative or protocol-relative target: %s", (path) => {
    expect(isSafeRedirectPath(path)).toBe(false);
  });
});
