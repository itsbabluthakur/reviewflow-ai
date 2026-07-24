# @reviewflow/ui

## Purpose

Shared design-system components, built on [shadcn/ui](https://ui.shadcn.com) (Radix primitives + Tailwind CSS), per [`UI_GUIDELINES.md`](../../UI_GUIDELINES.md) and [`DECISIONS.md`](../../DECISIONS.md) (ADR-0006). Consumed via the `@reviewflow/ui` workspace import.

## What belongs here

- shadcn/ui components generated with `pnpm dlx shadcn@latest add <component>`, run from this package.
- Small composed components built from those primitives, once they're needed by more than one app.

## What should NOT be placed here

- App-specific layout, pages, or routing — those belong in the consuming app under `apps/*`.
- Business logic — components here should be presentational and reusable across any app.
- One-off components only ever used by a single app — keep those local to that app until a second consumer appears.

## Usage

```tsx
import { Button } from "@reviewflow/ui";
```

All components are re-exported from the package's single entry point ([`src/index.ts`](./src/index.ts)); there is no deep-import path.

## Adding a new component

The shadcn/ui CLI generates into a single app, so components are generated in `apps/web` (where `components.json` lives) and then moved here:

```bash
cd apps/web
pnpm dlx shadcn@latest add <component>
```

Then, from the repository root:

1. Move the generated file(s) from `apps/web/src/components/ui/` to `packages/ui/src/components/ui/`.
2. Change any `from "@/lib/utils"` import to `from "@reviewflow/utils"`, and any `from "@/components/ui/<name>"` import to a relative `./`-import within this package.
3. Add the component's exports to [`src/index.ts`](./src/index.ts).
4. Add any new dependency the component needs (e.g. a `radix-ui` primitive) to this package's `package.json`, not `apps/web`'s.

See [`components.json`](../../apps/web/components.json) for the shadcn/ui configuration (aliases, style, base color) used during generation.
