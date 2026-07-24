# ADR-0001: Developer workflow tooling

**Status:** Accepted
**Date:** 2026-07-24

## Context

Sprint 1A established the monorepo foundation (Turborepo, pnpm workspaces, shared packages, a health endpoint) but had no automated guardrails: nothing stopped an unformatted or unlinted commit, commit messages had no enforced structure, there was no test runner wired up anywhere, and CI only ran `lint`/`typecheck`/`test`/`build` without caching or browser-level checks. As the team grows past a single contributor, these guardrails need to exist before feature work (Sprint 1B+) starts, or inconsistency compounds.

## Decision

Adopt the following, scoped strictly to developer experience — no application features:

- **Husky** for git hooks (`pre-commit`, `commit-msg`), installed automatically via the root `prepare` script so every clone gets hooks with no manual step.
- **lint-staged** to run `eslint --fix` and `prettier --write` only on staged files at commit time (`.lintstagedrc.json`), not the whole repo — keeps commits fast regardless of repo size.
- **Commitlint** (`@commitlint/config-conventional`) enforced via the `commit-msg` hook, requiring [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, …) — this was already documented convention in `CLAUDE.md`/`CONTRIBUTING.md` but previously unenforced.
- **Vitest** for unit tests, with a shared root `vitest.config.ts` that per-package configs extend via `mergeConfig` — the same "shared base, package extends it" pattern already used by `tsconfig.base.json`.
- **Playwright** for a single smoke suite (`tests/e2e/smoke.spec.ts`): home page renders, `/api/health` returns 200. Deliberately not feature-level e2e coverage — there are no features yet.
- **syncpack** to keep dependency version ranges consistent across every workspace `package.json` (`.syncpackrc.json`, `deps:check` / `deps:fix` scripts).
- **knip** to surface unused dependencies, files, and exports (`knip.json`, `deps:unused` script).

Both syncpack and knip are advisory local/CI-optional tools, not wired into the CI gate — false-positive risk (e.g. peer dependencies, framework plugin auto-detection) is high enough that a hard gate would need ongoing tuning attention this sprint doesn't scope for.

## Consequences

- New contributors get consistent formatting and commit history for free — no reliance on remembering to run `pnpm format` or writing conventional messages by convention alone.
- `pnpm install` now always installs and wires the git hooks (via `prepare`), so hooks can't silently be "forgotten" after a fresh clone.
- CI (`.github/workflows/ci.yml`) now runs `typecheck` → `lint` → `build` → `test` (Vitest) → Playwright smoke tests on a Node 22 matrix, restoring both the pnpm store and the Turborepo cache, and fails immediately on the first non-zero step.
- `knip` currently reports `@reviewflow/{types,ui,utils,supabase}` as unused in `apps/web` (and `apps/web/src/lib/supabase.ts` as an unused file) — this is expected: these packages/files are scaffolded ahead of the features that will consume them (UI components, auth). Do not remove them to silence the finding; re-evaluate once a later sprint lands actual usage.
- Adds seven new dev-only dependencies at the root. None ship in any production bundle (`apps/web`'s `next build` output is unaffected — verified as part of this sprint).
