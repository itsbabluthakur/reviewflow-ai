# @reviewflow/types

## Purpose

Shared TypeScript types and interfaces used by more than one app or package. Consumed via the `@reviewflow/types` workspace import.

## What belongs here

- Generic utility types (e.g. `Nullable<T>`, `Maybe<T>`) with no domain-specific meaning.
- Cross-cutting interfaces shared by multiple apps/packages (e.g. `HealthStatus`, the shape returned by `GET /api/health`).

## What should NOT be placed here

- Types owned by a single package or app — keep those colocated with their source.
- Database row types — those belong in `packages/database` once it is built out (see `DATABASE.md`).
- Runtime logic of any kind — this package exports types only, no functions or values with behavior.

## Usage

```ts
import type { HealthStatus } from "@reviewflow/types";
```
