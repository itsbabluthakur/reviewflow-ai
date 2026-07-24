import { defineConfig } from "vitest/config";

/**
 * Repository-wide Vitest defaults. Individual packages extend this via
 * `mergeConfig` in their own vitest.config.ts rather than repeating it,
 * mirroring how packages/*\/tsconfig.json extend tsconfig.base.json.
 */
export default defineConfig({
  test: {
    environment: "node",
    watch: false,
    passWithNoTests: true,
  },
});
