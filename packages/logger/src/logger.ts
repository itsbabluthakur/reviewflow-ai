import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Root logger. JSON to stdout in production (for log aggregation); pretty,
 * colorized output in every other environment. Prefer `createLogger` for a
 * module-scoped child logger and `getContextLogger` inside a request for one
 * bound to the active request/correlation IDs — reach for this directly only
 * at process startup, before any request context exists.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  base: { service: "reviewflow-ai" },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
        },
      }),
});

export type Logger = pino.Logger;

/** A named child logger for a specific module/package (e.g. `createLogger({ module: "database" })`). */
export function createLogger(bindings: Record<string, unknown>): Logger {
  return logger.child(bindings);
}
