import { defineConfig, mergeConfig } from "vitest/config";
import rootConfig from "../../vitest.config";

export default mergeConfig(
  rootConfig,
  defineConfig({
    test: {
      include: ["src/**/*.test.ts"],
      // Repository/seed tests share one real Postgres database and truncate
      // tables between tests (see src/repository/test-db.ts) — running
      // files in parallel would let one file's truncate/insert race another
      // file's, so all test files in this package run sequentially.
      fileParallelism: false,
    },
  }),
);
