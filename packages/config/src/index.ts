export { loadEnv, resetEnvCache, type Env } from "./env";

/**
 * Read an environment variable, falling back to `fallback` if unset.
 * Throws if the variable is unset and no fallback is provided, so
 * misconfiguration fails fast at startup rather than deep in a request.
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value !== undefined) {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Missing required environment variable: ${key}`);
}

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
export const isTest = process.env.NODE_ENV === "test";
