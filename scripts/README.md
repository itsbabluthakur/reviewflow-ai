# scripts/

## Purpose

Standalone operational scripts that don't belong to a single app or package — things run manually or from CI, not imported at runtime.

## Responsibilities

* One-off or repeatable operational tasks: database seeding helpers, release/version bumping, environment validation, data backfills.
* Scripts should be small, self-contained, and safe to re-run (idempotent) wherever practical.

## What belongs here

* Node/TypeScript or shell scripts invoked via `pnpm <script-name>` or directly in CI.
* Scripts that operate *across* the monorepo (e.g. checking that every package has a `README.md`), rather than inside a single package.

## What should NOT be placed here

* Application or package source code — reusable logic should live in `packages/utils` (or the relevant package) and be imported by the script, not duplicated here.
* Database migrations — those belong in `supabase/migrations`.
* Secrets or environment-specific credentials — scripts should read these from environment variables, never hardcode them.

Each non-trivial script should start with a short comment explaining what it does and how to run it.
