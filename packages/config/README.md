# @reviewflow/config

## Purpose

Shared runtime configuration and environment-variable access shared across ReviewFlow AI apps and packages. Consumed via the `@reviewflow/config` workspace import.

## What belongs here

- Environment variable readers with safe fallback/fail-fast behavior (`getEnv`).
- Environment mode flags (`isProduction`, `isDevelopment`, `isTest`).
- The [zod](https://zod.dev/)-validated environment schema (`loadEnv`, `Env`) — the single source of truth for which environment variables the app actually reads. Extend the schema in `src/env.ts` when a feature starts depending on a new variable (see root [`.env.example`](../../.env.example) for the full reserved-key catalog).
- `parseEnv` — the shared "parse a zod schema against `process.env`, throw one aggregated `ConfigurationError` on failure" helper that `loadEnv` itself uses. Package-specific env schemas that need a variable to be _required_ (this schema only validates shape, treating everything as optional at this layer) — e.g. `packages/database`'s `DATABASE_URL`, `packages/supabase`'s Supabase keys — reuse this instead of reimplementing the same aggregate-and-throw logic.

## What should NOT be placed here

- Secrets or real environment values — see root [`.env.example`](../../.env.example) for the actual variable list.
- Business or domain configuration (feature flags tied to a specific feature, plan limits, etc.) — those belong closer to the feature that owns them.
- Build tooling configuration (ESLint/TypeScript/Tailwind presets) — those live at the repository root and are extended directly by each package.

## Usage

```ts
import { getEnv, isProduction, loadEnv } from "@reviewflow/config";

const appUrl = getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

// Validates process.env against the shared zod schema, throwing a single
// aggregated error listing every invalid/missing variable if it fails.
// See apps/web's GET /api/ready for the fail-fast usage — deliberately not
// called from next.config.mjs, which the production Docker image needs to
// load with zero workspace-package imports (see docker/README.md).
const env = loadEnv();
```
