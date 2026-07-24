/**
 * Generic utility types shared across the monorepo.
 */
export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;

/**
 * Shape returned by the platform health check endpoint (GET /api/health).
 */
export interface HealthStatus {
  status: "ok" | "error";
  service: string;
  version: string;
}
