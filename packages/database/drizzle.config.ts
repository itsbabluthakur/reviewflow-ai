import { defineConfig } from "drizzle-kit";

// Intentionally reads process.env directly rather than the validated
// loadDatabaseEnv() — `drizzle-kit generate` only diffs the schema file
// against the existing migrations snapshot and needs no live connection, so
// requiring DATABASE_URL for every drizzle-kit command (including that one)
// would be an unnecessary restriction. Commands that do need a connection
// (`migrate`, `push`, `studio`) fail with drizzle-kit's own clear error if
// it's unset.
export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "../../supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
