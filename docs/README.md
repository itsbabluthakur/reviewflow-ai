# docs/

## Purpose

Supplementary, deep-dive documentation that supports — but does not replace — the authoritative root-level documents (`PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `SECURITY.md`, `UI_GUIDELINES.md`, `ROADMAP.md`). Those root documents remain the single source of truth; files under `docs/` expand on specific topics in more detail than belongs at the root.

## Structure

```text
docs/
  architecture/   # Architecture Decision Records (ADRs), diagrams, deep dives
  deployment/      # Environment setup, deployment runbooks, release procedures
  api/             # Generated/detailed API reference material (e.g. OpenAPI spec)
  product/         # Supporting product research, personas, competitive notes
```

## What belongs here

* Longer-form or generated material that would clutter the root documents (diagrams, ADRs, runbooks, OpenAPI output).
* Content that links back to and expands on a specific section of a root document.

## What should NOT be placed here

* Anything that contradicts or duplicates a root document without updating that document — the root docs are authoritative per [`CLAUDE.md`](../CLAUDE.md).
* Application code or configuration.

See each subdirectory's `README.md` for topic-specific guidance.
