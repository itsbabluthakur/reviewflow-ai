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

### Changed

- `.github/workflows/ci.yml`: now restores the Turborepo cache, runs `typecheck` → `lint` → `build` → `test` → Playwright smoke tests (in that order) on a Node 22 matrix, and fails immediately on the first failing step.
- `.github/workflows/ci.yml` and `release.yml`: `pnpm/action-setup` no longer hardcodes a pnpm version that could drift from the `packageManager` field in `package.json`; it now reads that field directly.
- Aligned `eslint`, `typescript`, `react`, and `react-dom` version ranges across every workspace `package.json` (previously inconsistent, e.g. root pinned `typescript@^5.7.0` while every package used `^5`).

- Consolidated five separate `eslint.config.mjs` files (root + four per-package shims + one Next-specific app config) into a single root config that every workspace inherits via ESLint's flat-config upward resolution.
- `turbo.json`: `lint` and `typecheck` no longer depend on `build` (they have no real build-order dependency), maximizing incremental/parallel execution.
- All `package.json` `clean` scripts now use `rimraf` instead of `rm -rf` for cross-platform (Windows/macOS/Linux) compatibility.
- Package source moved from `packages/*/index.ts` to `packages/*/src/index.ts`, with `main`/`types`/`exports` updated accordingly.

[Unreleased]: https://github.com/itsbabluthakur/reviewflow-ai/compare/main...HEAD
