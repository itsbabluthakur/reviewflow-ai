# DECISIONS.md

# Architecture Decision Records

**Version:** 1.0

This document records the foundational technical decisions behind ReviewFlow AI: the context that motivated each choice, the decision itself, and its consequences. It complements [`ARCHITECTURE.md`](ARCHITECTURE.md) (the system design) by explaining _why_, not just _what_. Topic-specific ADRs that come later belong in [`docs/architecture/`](docs/architecture/README.md); this file holds the decisions the project was founded on.

---

## ADR-0001: Why Next.js

**Context**

The product needs a single framework that serves marketing-adjacent pages, an authenticated dashboard, and server-side API logic, while supporting fast iteration for a small team building an MVP under time pressure.

**Decision**

Use Next.js 15 (App Router) as the primary application framework, per [`CLAUDE.md`](CLAUDE.md) and [`ARCHITECTURE.md`](ARCHITECTURE.md) section 2.

**Consequences**

- Server Components and Route Handlers let UI and API logic live in one codebase, reducing coordination overhead for a small team.
- First-class Vercel deployment support matches the deployment strategy in `ARCHITECTURE.md` section 19.
- Ties the frontend to the React/Next.js release cadence and its App Router conventions; migrating away later would touch every page.

---

## ADR-0002: Why Supabase

**Context**

The MVP needs authentication, a Postgres database, file storage, and realtime capability, without the team building and operating that infrastructure from scratch.

**Decision**

Use Supabase as the primary backend platform (Auth, Postgres, Storage), per `ARCHITECTURE.md` section 19 and `SECURITY.md` section 2.

**Consequences**

- Row Level Security (`SECURITY.md` section 6) becomes the primary tenant-isolation mechanism, which the team must design carefully rather than relying solely on application-layer checks.
- Managed Auth removes the need to build password hashing, session handling, and OAuth flows from scratch.
- Introduces a dependency on Supabase's hosted platform and its migration/CLI tooling for schema management.

---

## ADR-0003: Why PostgreSQL

**Context**

The domain model is deeply relational (agencies → businesses → locations → customers, with campaigns, reviews, and billing all referencing each other) and requires strong consistency and constraint enforcement.

**Decision**

Use PostgreSQL as the sole system of record, per `DATABASE.md` section 1.

**Consequences**

- Foreign keys, constraints, and RLS give strong data-integrity guarantees without extra application code.
- Relational modeling requires deliberate schema design up front (see `DATABASE.md` for the full table catalog) rather than ad-hoc document shapes.
- Comes bundled with the choice of Supabase, which hosts and manages Postgres for us.

---

## ADR-0004: Why Drizzle ORM

**Context**

The team wants type-safe database access from TypeScript, with SQL-like ergonomics and predictable, inspectable queries, without a heavyweight ORM abstraction.

**Decision**

Use Drizzle ORM as the query layer over PostgreSQL, per `DATABASE.md` (header) and `ARCHITECTURE.md` section 4 (Repository Layer).

**Consequences**

- Query shapes stay close to SQL, making performance easy to reason about and debug.
- Migrations are explicit and reviewable, aligning with the "never edit an applied migration" rule in `DATABASE.md` section 19.
- Smaller ecosystem and fewer implicit conveniences than a full-featured ORM like Prisma; the team accepts writing slightly more explicit code in exchange for transparency.

---

## ADR-0005: Why Turborepo

**Context**

The codebase is organized as a monorepo (`apps/*`, `packages/*` per `ARCHITECTURE.md` section 3) and needs fast, cached builds/lint/test runs as the number of packages grows.

**Decision**

Use Turborepo with pnpm workspaces to orchestrate builds, linting, type checking, and tests across the monorepo (see `turbo.json` and `pnpm-workspace.yaml`).

**Consequences**

- Task caching and dependency-aware task graphs keep CI (`ci.yml`) fast as the monorepo grows.
- Every package needs consistent script names (`dev`, `build`, `lint`, `typecheck`, `test`) so Turborepo's task graph can find them.
- Adds a build-orchestration layer that contributors need to understand, on top of pnpm itself.

---

## ADR-0006: Why shadcn/ui

**Context**

The product needs a consistent, accessible component library that matches the design goals in `UI_GUIDELINES.md` (minimal, professional, fast) without adopting a heavy pre-styled component framework that fights customization.

**Decision**

Use shadcn/ui (Radix primitives + Tailwind CSS) as the base component layer, per `README.md` and `UI_GUIDELINES.md`.

**Consequences**

- Components are copied into `packages/ui` rather than installed as an opaque dependency, so the team owns and can freely customize every component.
- Radix primitives provide accessibility (focus management, keyboard nav, ARIA) out of the box, supporting `UI_GUIDELINES.md` section 22.
- Requires the team to keep components up to date manually rather than via a simple version bump.

---

## ADR-0007: Why a Modular Monolith

**Context**

The MVP has a small team and an evolving domain (customers, reviews, campaigns, billing, AI). Full microservices would add operational overhead the team can't yet justify, but a tangled single-layer app would become unmaintainable as features grow.

**Decision**

Build a modular monolith with clear service boundaries (Customer, Review, Campaign, Billing, Analytics), per `ARCHITECTURE.md` sections 1 and 18, with the explicit option to extract services later if warranted.

**Consequences**

- One deployable unit keeps operations simple during the MVP phase (single build, single deploy, no distributed-transaction concerns).
- Enforced service/repository layering (`ARCHITECTURE.md` section 4) means a future extraction into standalone services is a refactor, not a rewrite, provided the boundaries are respected.
- Requires discipline: without enforced boundaries, a modular monolith can quietly become a tangled monolith. Code review must check for cross-module leakage (`CONTRIBUTING.md`, Code Review Checklist).

---

## ADR-0008: Why REST API

**Context**

The platform needs an API contract usable by the web app, a future mobile app, and eventually third-party integrations, with tooling and conventions the whole team already knows.

**Decision**

Use a versioned REST API (`/api/v1`) as the official contract, per `API.md` sections 1 and 25.

**Consequences**

- Well-understood conventions (status codes, pagination, filtering) mean less onboarding time for new contributors and third-party integrators.
- Versioning (`/api/v1`, future `/api/v2`) gives a clear deprecation path as the API evolves, per `API.md` (Base URL).
- Less flexible for clients needing to shape responses precisely (a tradeoff GraphQL would address); acceptable given the API's primary consumer is the first-party web app.

---

## ADR-0009: Why `packages/*` are composite TypeScript projects but `apps/web` is not

**Context**

Root-level TypeScript project references require every referenced project to set `"composite": true`. The natural instinct is to reference every workspace — `apps/web` included — from a root `tsconfig.json`.

**Decision**

Root [`tsconfig.json`](tsconfig.json) references only the four shared packages (`types`, `utils`, `config`, `ui`), each with `composite: true`, `declaration: true`, and its own `src`/`dist` split. `apps/web` deliberately keeps its Next.js-generated tsconfig (`noEmit: true`, no `composite`) and is excluded from the root reference graph.

**Consequences**

- Verified empirically: setting `composite: true` on `apps/web/tsconfig.json` makes `next build` succeed but print `⚠ TypeScript project references are not fully supported. Attempting to build in incremental mode.` — a known Next.js limitation, not a misconfiguration. Excluding the app from the composite graph keeps the production build warning-free.
- The four packages still gain a real, working project-reference graph — verified with `tsc --build tsconfig.json`, which builds all four in dependency order and emits `dist/*.d.ts`.
- `apps/web` continues to consume all four packages as plain TypeScript source (via `transpilePackages` in `next.config.mjs`), unaffected by whether they're composite — composite/`dist` output is not on the app's actual build or dev path today.
- Packages intentionally do **not** reference each other in their own `tsconfig.json` (e.g. `ui` does not declare a TS reference on `utils`, even though it depends on it at the package.json level): TypeScript's project-reference resolution requires a referenced composite project's `dist` output to already exist and be current (error `TS6305` otherwise), which would make `typecheck` depend on a prior `build` — exactly the coupling this monorepo's Turborepo task graph (`turbo.json`) deliberately avoids for `lint`/`typecheck`.

---

Future decisions should be added as new ADR entries here (for foundational, project-wide choices) or as separate files in [`docs/architecture/`](docs/architecture/README.md) (for narrower, topic-specific choices), following the template in that directory's README.
