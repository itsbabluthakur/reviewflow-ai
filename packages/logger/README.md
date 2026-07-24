# @reviewflow/logger

## Purpose

Shared structured logging for ReviewFlow AI apps and packages, built on [Pino](https://getpino.io/). Consumed via the `@reviewflow/logger` workspace import. This is the **only** package permitted to reach for `console.*` directly — everywhere else, use this package instead.

## What belongs here

- The root logger (`logger`) and child-logger factory (`createLogger`).
- Request-scoped context propagation (`runWithRequestContext`, `getRequestContext`, `getContextLogger`), built on Node's `AsyncLocalStorage` so request/correlation IDs reach every log line without threading them through every function call.

## What should NOT be placed here

- Next.js-specific request/response handling (header extraction, middleware) — this package is framework-agnostic by design. The Next.js adapter lives in `apps/web/src/lib/request-context.ts`.
- Error classes — those belong in `@reviewflow/errors`; log them with `serializeError` from that package.

## Usage

```ts
import { logger, createLogger, getContextLogger } from "@reviewflow/logger";

// Module-scoped child logger, bound once.
const dbLogger = createLogger({ module: "database" });
dbLogger.info({ table: "infra_probe" }, "seed row inserted");

// Inside a request (after runWithRequestContext has bound requestId/correlationId):
getContextLogger().warn({ latencyMs: 812 }, "slow query");
```

## Output format

- **Development / test** (`NODE_ENV !== "production"`): pretty, colorized, human-readable — via [`pino-pretty`](https://github.com/pinojs/pino-pretty), a dev-only dependency never installed in the production Docker image.
- **Production** (`NODE_ENV === "production"`): newline-delimited JSON to stdout — the shape log aggregators (and `SECURITY.md` section 17's "never log secrets" rule) expect.

Log level defaults to `debug` outside production and `info` in production; override with `LOG_LEVEL`.
