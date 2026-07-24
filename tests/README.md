# tests/

## Purpose

Cross-cutting test suites that verify behavior across apps and packages, plus shared fixtures used by those suites. Package-local unit tests may still live alongside their source inside `packages/*`; this directory is for tests that don't naturally belong to a single package.

## Structure

```text
tests/
  unit/          # Cross-package unit tests
  integration/   # Tests exercising multiple packages/services together (e.g. API + database)
  e2e/           # End-to-end tests driving the running application (e.g. Playwright)
  fixtures/      # Shared test data, factories, and mocks
```

## What belongs here

* Integration and end-to-end tests that span more than one package or app.
* Shared fixtures, factories, and test utilities reused across multiple test suites.

## What should NOT be placed here

* Pure unit tests for a single package's internal logic — prefer colocating those with the package's source (e.g. `packages/utils/src/foo.test.ts`) so they move with the code.
* Application code — this directory should contain only tests and test support code.

Per [`CLAUDE.md`](../CLAUDE.md) (Testing) and [`ROADMAP.md`](../ROADMAP.md) (Testing Requirements), every feature requires unit, integration, and (where applicable) end-to-end coverage before it is considered done.
