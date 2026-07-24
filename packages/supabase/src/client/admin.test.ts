import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ConfigurationError } from "@reviewflow/errors";
import { resetSupabaseEnvCache } from "../env";
import { createAdminSupabaseClient } from "./admin";

const ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  resetSupabaseEnvCache();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
  resetSupabaseEnvCache();
  delete (globalThis as { window?: unknown }).window;
});

describe("createAdminSupabaseClient", () => {
  it("throws ConfigurationError when called in a browser-like context", () => {
    (globalThis as { window?: unknown }).window = {};
    expect(() => createAdminSupabaseClient()).toThrow(ConfigurationError);
  });

  it("throws ConfigurationError when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminSupabaseClient()).toThrow(ConfigurationError);
  });

  it("succeeds when window is absent and all required vars are set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    expect(() => createAdminSupabaseClient()).not.toThrow();
  });
});
