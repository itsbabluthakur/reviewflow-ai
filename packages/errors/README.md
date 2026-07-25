# @reviewflow/errors

## Purpose

The shared error hierarchy and API response helpers used across ReviewFlow AI apps and packages. Consumed via the `@reviewflow/errors` workspace import.

## What belongs here

- `AppError` and its subclasses (`ValidationError`, `ConfigurationError`, `DatabaseError`, `AuthenticationError`, `AuthorizationError`) — every deliberately thrown, typed error in the platform.
- `toApiSuccessResponse` / `toApiErrorResponse` — builders for the standard response envelope defined in [`API.md`](../../API.md) section 3.
- `serializeError` — normalizes any thrown value into a structured, log-friendly shape (stack traces included only outside production).

## What should NOT be placed here

- Business-specific error types (e.g. `CustomerNotFoundError`) — those belong closer to the domain that owns them, extending `AppError`.
- Logging transport/output configuration — that belongs in `@reviewflow/logger`.
- Zod schemas — those belong in `packages/validation` (forms/API payloads) or a package's own `env.ts` (environment variables).

## Usage

```ts
import {
  ValidationError,
  toApiErrorResponse,
  getStatusCode,
  serializeError,
} from "@reviewflow/errors";
import { logger } from "@reviewflow/logger";

try {
  if (!email) {
    throw new ValidationError("Customer email is required.", { context: { field: "email" } });
  }
} catch (error) {
  logger.error(serializeError(error), "request failed");
  return Response.json(toApiErrorResponse(error), { status: getStatusCode(error) });
}
```

## Design notes

- `AuthenticationError` (401) means "we don't know who you are"; `AuthorizationError` (403) means "we know who you are, but you can't do this" (e.g. `@reviewflow/auth`'s `requireMembership` throws it when an authenticated user has no membership in the target agency). Don't conflate the two.
- `isOperational` distinguishes anticipated, handled failures (bad input, missing config, a database call that failed) from unexpected programming bugs. All four error classes here default to `isOperational: true` — they represent known failure categories, not crashes.
- `toApiErrorResponse` never reflects a non-`AppError`'s message back to the client (`INTERNAL_ERROR`, generic message) — per [`SECURITY.md`](../../SECURITY.md) section 9, unexpected error detail must not leak to callers.
