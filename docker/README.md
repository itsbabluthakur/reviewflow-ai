# docker/

## Purpose

Container definitions for local development and deployment builds that are not already managed by the Supabase CLI.

## Responsibilities

- Provide Dockerfiles for building deployable app images (CI/CD and self-hosted environments).
- Provide supplementary local services referenced by the root `docker-compose.yml` (for example an SMTP test server for email development).

## What belongs here

- `Dockerfile`s, one per deployable target, named for what they build (e.g. `Dockerfile.web`).
- Small supporting config files (e.g. nginx config, health-check scripts) used only by those containers.

## What should NOT be placed here

- The primary local Postgres/Auth/Storage stack — that's owned by the Supabase CLI (`supabase start`), not Docker Compose, to avoid running two divergent database stacks locally.
- Application source code — Dockerfiles here should `COPY` from `apps/` and `packages/`, not contain business logic.
- Secrets — use `.env` files (git-ignored) referenced by `docker-compose.yml`, never hardcoded values.

## Current images

- `Dockerfile.web` — production image for `apps/web` (`@reviewflow/web`). Multi-stage: prunes the monorepo to just what that app needs (`turbo prune --docker`), installs and builds, then a second production-only install keeps devDependencies out of the runtime image. Runs as a non-root user; `HEALTHCHECK` polls `GET /api/live`.

  ```bash
  docker build -f docker/Dockerfile.web -t reviewflow-web .
  docker run -p 3000:3000 -e DATABASE_URL=postgresql://... reviewflow-web
  ```

  Verified end-to-end against a real container run: `docker ps` reports `(healthy)`, and `/api/health`, `/api/live`, `/api/ready` (including live database connectivity) all respond correctly.

  **`apps/web/next.config.mjs`, not `.ts`, on purpose.** `next start` needs the `typescript` package to load a `.ts` config file — and the runtime image deliberately excludes it (a devDependency, dropped by the `--prod` install in stage 3). A `.ts` config here fails at container startup: Next.js tries to auto-install `typescript` via `yarn` from inside the running container, which has no registry access and shouldn't be mutating its own dependencies at runtime regardless. Keep this config as plain `.mjs` (data only, no imports that need transpiling) rather than reintroducing a `.ts` config that only works because a build-time devDependency happens to be present.

See the root [`docker-compose.yml`](../docker-compose.yml) for the current set of local services, and [`ARCHITECTURE.md`](../ARCHITECTURE.md) section 19 (Deployment) for how this fits into the deployment pipeline.
