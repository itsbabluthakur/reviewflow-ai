# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Monorepo foundation: `apps/`, `packages/`, `supabase/`, `docker/`, `scripts/`, `tests/`, and `docs/` directory structure, each with a README describing its purpose.
- Tooling configuration: `.editorconfig`, `.prettierrc`, `.prettierignore`, `eslint.config.mjs`, root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `docker-compose.yml`.
- Comprehensive `.env.example` covering application, Supabase, database, Google OAuth, OpenAI, Stripe, Resend, Twilio, Sentry, and analytics configuration.
- GitHub project health files: `dependabot.yml`, `release.yml` workflow, `FUNDING.yml`.
- Governance documentation: `CODE_OF_CONDUCT.md`, `DECISIONS.md`.
- Planning documentation: `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `SECURITY.md`, `UI_GUIDELINES.md`, `ROADMAP.md`, `CLAUDE.md`, `CONTRIBUTING.md`.
- `apps/web`: Next.js 15 + React 19 + TypeScript (strict) + Tailwind CSS v4 application with a health-check landing page and `GET /api/health`.
- `packages/{ui,config,types,utils}`: shared workspace packages, including four shadcn/ui components (Button, Card, Input, Dialog) in `@reviewflow/ui`.
- Root `tsconfig.json` with real TypeScript project references across the four shared packages (`tsc --build` builds them in dependency order).
- Git hooks via Husky: `pre-commit` runs `lint-staged` (ESLint `--fix` + Prettier `--write` on staged files only), `commit-msg` runs Commitlint against Conventional Commits. Installed automatically via the root `prepare` script.
- Vitest, with a shared root `vitest.config.ts` extended per-package (`mergeConfig`), and a first example test suite in `packages/utils/src/index.test.ts`.
- Playwright, with a root `playwright.config.ts` and one infrastructure smoke test (`tests/e2e/smoke.spec.ts`): home page renders, `GET /api/health` returns 200.
- `@reviewflow/config`: zod-validated environment schema (`loadEnv`, `Env`, in `src/env.ts`), wired into `apps/web/next.config.ts` so misconfigured environment variables fail the build/boot instead of failing deep in a request.
- syncpack (`.syncpackrc.json`, `deps:check`/`deps:fix`) and knip (`knip.json`, `deps:unused`) for cross-workspace dependency-version consistency and unused-dependency detection.
- `docs/architecture/0001-developer-workflow-tooling.md`: ADR covering the tooling choices above.
- `packages/database`: Drizzle ORM (`drizzle-orm/postgres-js`) schema entry point, lazily-initialized shared client (`getDb`, `checkDatabaseConnection`), migration runner (`db:migrate`) and idempotent seed runner (`db:seed`), and generic repository infrastructure (`BaseRepository`, `withTransaction`, pagination helpers). Migration SQL is generated (`db:generate`) into `supabase/migrations`, not the package itself. Exactly one table, `_infra_probe` — internal-only, proving the pipeline works, verified end-to-end against a live Postgres container.
- `packages/database`: first domain schema — `users`, `agencies`, `memberships` tables (with Drizzle `relations()`: user↔agency many-to-many via membership, unique on `(agency_id, user_id)`), replacing the now-redundant `_infra_probe` proof-point table (removed as its own migration). `UserRepository`, `AgencyRepository`, `MembershipRepository` extend `BaseRepository` with infrastructure-only finders (`findByEmail`, `findBySlug`, `findByAgencyAndUser`, `findMembers`, `findUserAgencies`). Idempotent seed now creates a demo agency (`ReviewFlow Demo` / `demo` / UTC), a demo user (`admin@example.com`), and an `owner` membership between them — verified end-to-end (migration generated and applied, seed run twice with no duplicate rows) against a live Postgres container. Repository and seed tests (17, `describe.skipIf`-gated on `DATABASE_URL` so `pnpm test` still passes without a database configured) verified both skipping cleanly and passing for real against that container. See [ADR-0004](docs/architecture/0004-first-domain-schema.md).
- `packages/supabase`: browser, server (generic cookie-adapter, framework-agnostic), and admin (service-role, guarded against browser-context use) Supabase client factories, each with their own lazily-validated env schema.
- `packages/logger`: structured logging on Pino — pretty output in development, JSON in production, module-scoped child loggers (`createLogger`), and `AsyncLocalStorage`-based request-context propagation (`runWithRequestContext`, `getContextLogger`).
- `packages/errors`: `AppError` base class plus `ValidationError`/`ConfigurationError`/`DatabaseError`, `toApiSuccessResponse`/`toApiErrorResponse` matching `API.md`'s response envelope, and `serializeError` for structured logging (stack traces outside production only).
- `apps/web`: `GET /api/live` (liveness, no dependency checks) and `GET /api/ready` (readiness — verifies environment config and database connectivity, `503` if either fails); Edge-safe request-ID/correlation-ID middleware (`src/middleware.ts`) plus a Node-runtime `withApiContext` wrapper (`src/lib/request-context.ts`) every Route Handler can use for consistent request logging and error-to-response conversion; a Next.js cookie adapter for `@reviewflow/supabase`'s server client (`src/lib/supabase.ts`).
- `docker/Dockerfile.web`: multi-stage production image for `apps/web` via `turbo prune`, with a separate production-only dependency install (keeps devDependencies out of the runtime image), non-root runtime user, and a `HEALTHCHECK` against `/api/live`. Root `.dockerignore` added. Verified end-to-end: built, run against a live database, `docker ps` reports `(healthy)`, all three health endpoints respond correctly through the container.
- Root scripts: `db:generate`, `db:migrate`, `db:seed`, delegating to `packages/database`.
- `docs/architecture/0002-database-and-migrations.md` and `0003-observability-and-error-handling.md`: ADRs covering the decisions above.

### Changed

- `.github/workflows/ci.yml`: now restores the Turborepo cache, runs `typecheck` → `lint` → `build` → `test` → Playwright smoke tests (in that order) on a Node 22 matrix, and fails immediately on the first failing step.
- `.github/workflows/ci.yml` and `release.yml`: `pnpm/action-setup` no longer hardcodes a pnpm version that could drift from the `packageManager` field in `package.json`; it now reads that field directly.
- Aligned `eslint`, `typescript`, `react`, and `react-dom` version ranges across every workspace `package.json` (previously inconsistent, e.g. root pinned `typescript@^5.7.0` while every package used `^5`).

- Consolidated five separate `eslint.config.mjs` files (root + four per-package shims + one Next-specific app config) into a single root config that every workspace inherits via ESLint's flat-config upward resolution.
- `turbo.json`: `lint` and `typecheck` no longer depend on `build` (they have no real build-order dependency), maximizing incremental/parallel execution.
- All `package.json` `clean` scripts now use `rimraf` instead of `rm -rf` for cross-platform (Windows/macOS/Linux) compatibility.
- Package source moved from `packages/*/index.ts` to `packages/*/src/index.ts`, with `main`/`types`/`exports` updated accordingly.
- `@reviewflow/config`: `getEnv` and `loadEnv` now throw `ConfigurationError` (from the new `@reviewflow/errors`) instead of a plain `Error`; extracted the shared "parse a zod schema, throw one aggregated error" logic into `parseEnv`, reused by `packages/database` and `packages/supabase`'s own env schemas. The shared schema also gained optional `LOG_LEVEL`, `DATABASE_URL`, `DATABASE_POOL_URL`, and Supabase key fields (shape-only — each owning package validates its own vars as required, lazily).
- `apps/web/next.config.ts` → `next.config.mjs`: `transpilePackages` extended to include `@reviewflow/{database,logger,errors,supabase}`. Converted from `.ts` to `.mjs` and dropped its `loadEnv()` call (that fail-fast check now lives solely at `GET /api/ready`) — a `.ts` config needs the `typescript` package to load, which the production Docker image's runtime `node_modules` deliberately excludes; see `docker/README.md`.

[Unreleased]: https://github.com/itsbabluthakur/reviewflow-ai/compare/main...HEAD
