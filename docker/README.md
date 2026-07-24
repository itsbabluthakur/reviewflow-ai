# docker/

## Purpose

Container definitions for local development and deployment builds that are not already managed by the Supabase CLI.

## Responsibilities

* Provide Dockerfiles for building deployable app images (CI/CD and self-hosted environments).
* Provide supplementary local services referenced by the root `docker-compose.yml` (for example an SMTP test server for email development).

## What belongs here

* `Dockerfile`s, one per deployable target, named for what they build (e.g. `Dockerfile.web`).
* Small supporting config files (e.g. nginx config, health-check scripts) used only by those containers.

## What should NOT be placed here

* The primary local Postgres/Auth/Storage stack — that's owned by the Supabase CLI (`supabase start`), not Docker Compose, to avoid running two divergent database stacks locally.
* Application source code — Dockerfiles here should `COPY` from `apps/` and `packages/`, not contain business logic.
* Secrets — use `.env` files (git-ignored) referenced by `docker-compose.yml`, never hardcoded values.

See the root [`docker-compose.yml`](../docker-compose.yml) for the current set of local services, and [`ARCHITECTURE.md`](../ARCHITECTURE.md) section 19 (Deployment) for how this fits into the deployment pipeline.
