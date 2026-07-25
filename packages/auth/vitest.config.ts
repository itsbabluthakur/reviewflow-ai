import { defineConfig, mergeConfig } from "vitest/config";
import rootConfig from "../../vitest.config";

export default mergeConfig(
  rootConfig,
  defineConfig({
    test: {
      include: ["src/**/*.test.ts"],
      // A subset of tests exercise real repositories against one live
      // Postgres database (see src/sync-user.test.ts), truncating tables
      // between tests — same reasoning as packages/database/vitest.config.ts.
      fileParallelism: false,
    },
  }),
);
