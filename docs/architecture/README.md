# Architecture Documentation

## Purpose

Deep-dive architecture material that supports the root [`ARCHITECTURE.md`](../../ARCHITECTURE.md) and [`DECISIONS.md`](../../DECISIONS.md) without bloating them. `ARCHITECTURE.md` remains the authoritative overview; this directory holds the detail behind it.

## What belongs here

* Architecture Decision Records (ADRs) for decisions too granular for `DECISIONS.md` (e.g. "why this caching library" rather than "why PostgreSQL").
* Sequence and component diagrams referenced from `ARCHITECTURE.md`.
* Notes from architecture reviews or spike investigations.

## What should NOT be placed here

* The high-level system overview — that stays in root `ARCHITECTURE.md`.
* Database schema detail — that belongs in root `DATABASE.md`.

## Suggested ADR template

```markdown
# ADR-NNNN: <title>

**Status:** Proposed | Accepted | Superseded
**Date:** YYYY-MM-DD

## Context
What problem are we solving? What constraints apply?

## Decision
What did we decide?

## Consequences
What becomes easier or harder as a result?
```

_No ADRs have been recorded here yet — the initial set of foundational decisions is documented in [`DECISIONS.md`](../../DECISIONS.md)._
