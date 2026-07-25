import { expect, test } from "@playwright/test";

test.describe("auth middleware", () => {
  test("allows public routes through without a session", async ({ request }) => {
    for (const path of ["/", "/api/health", "/api/live", "/api/ready"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.headers()["location"]).toBeUndefined();
    }
  });

  test("redirects an anonymous request to a protected page, preserving the destination", async ({
    request,
  }) => {
    const response = await request.get("/dashboard", { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toBe("/login?redirect=%2Fdashboard");
  });

  test("does not redirect /login itself (no redirect loop)", async ({ request }) => {
    const response = await request.get("/login", { maxRedirects: 0 });

    expect(response.headers()["location"]).toBeUndefined();
  });

  test("protects /settings, /account, and /profile the same way as /dashboard", async ({
    request,
  }) => {
    for (const path of ["/settings", "/account", "/profile"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(response.headers()["location"]).toBe(`/login?redirect=${encodeURIComponent(path)}`);
    }
  });

  test("returns a standard 401 JSON error (not a redirect) for an anonymous protected API call", async ({
    request,
  }) => {
    const response = await request.get("/api/private/me", { maxRedirects: 0 });

    expect(response.status()).toBe(401);
    expect(response.headers()["location"]).toBeUndefined();
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: { code: "AUTHENTICATION_ERROR", message: "Authentication required." },
    });
  });
});
