# Deployment Documentation

## Purpose

Operational documentation for deploying, configuring, and operating ReviewFlow AI in each environment. This complements [`ARCHITECTURE.md`](../../ARCHITECTURE.md) section 19 (Deployment), which describes the target platforms (Vercel, Supabase, Cloudflare) at a high level.

## What belongs here

* Environment setup guides (local, staging, production).
* Release and rollback runbooks.
* Required environment variables per environment (see root [`.env.example`](../../.env.example) for the full list and descriptions).
* Incident response and on-call procedures, in line with [`SECURITY.md`](../../SECURITY.md) section 29 (Incident Response).

## What should NOT be placed here

* Application configuration files themselves (those live at the relevant app/package root).
* Secrets or real credentials of any kind.

## Suggested contents (to be filled in as the platform matures)

* `local-setup.md` — getting a full local environment running.
* `staging.md` / `production.md` — environment-specific deployment notes.
* `runbook.md` — step-by-step release and rollback procedure.

_No environment-specific runbooks exist yet — this directory is scaffolded ahead of Phase 15 (Production Readiness) in [`ROADMAP.md`](../../ROADMAP.md)._
