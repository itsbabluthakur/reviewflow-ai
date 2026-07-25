import { defineConfig, mergeConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import rootConfig from "../../vitest.config";

/**
 * Overrides the root's `environment: "node"` with jsdom — this package's
 * tests render React components (Sidebar, Navbar, UserMenu, forms), unlike
 * every other workspace's plain-Node unit tests.
 */
export default mergeConfig(
  rootConfig,
  defineConfig({
    plugins: [react()],
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.{ts,tsx}"],
      setupFiles: ["./vitest.setup.ts"],
    },
  }),
);
