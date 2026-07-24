import { defineConfig, devices } from "@playwright/test";

// A dedicated, non-default port: avoids colliding with whatever else a
// developer's machine may already have bound to 3000.
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

/**
 * Smoke-test config only — see tests/e2e/smoke.spec.ts. Feature-level e2e
 * coverage is deferred until there are features to cover.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm --filter @reviewflow/web build && pnpm --filter @reviewflow/web start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { PORT: String(PORT) },
  },
});
