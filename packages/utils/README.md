# @reviewflow/utils

## Purpose

Small, framework-agnostic helper functions shared across ReviewFlow AI apps and packages. Consumed via the `@reviewflow/utils` workspace import.

## What belongs here

- Pure functions with no React, Next.js, or Node-specific runtime dependency (aside from `cn`, which is UI-framework-agnostic even though it supports React className merging).
- `cn` — merges conditional class names and resolves conflicting Tailwind classes; used throughout `@reviewflow/ui` and app-level components.

## What should NOT be placed here

- React components or hooks — those belong in `@reviewflow/ui` or an app's `hooks/` directory.
- Business logic — this package has no knowledge of customers, reviews, or any other domain concept.
- Environment/config access — that belongs in `@reviewflow/config`.

## Usage

```ts
import { cn } from "@reviewflow/utils";

cn("px-2 py-1", isActive && "bg-primary", className);
```
