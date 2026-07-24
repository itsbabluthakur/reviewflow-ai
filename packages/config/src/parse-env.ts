import type { z } from "zod";
import { ConfigurationError } from "@reviewflow/errors";

/**
 * Parses `source` against `schema`, throwing a single ConfigurationError
 * listing every invalid/missing variable if it fails. Shared by every
 * package-specific env schema (see packages/database/src/env.ts,
 * packages/supabase/src/env.ts) so each doesn't reimplement the same
 * aggregate-and-throw logic.
 */
export function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: NodeJS.ProcessEnv = process.env,
  label = "environment variables",
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new ConfigurationError(`Invalid ${label}:\n${issues}`, {
      context: { issues: result.error.issues },
    });
  }
  return result.data as z.infer<T>;
}
