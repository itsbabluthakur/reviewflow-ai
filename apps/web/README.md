# @reviewflow/web

The primary ReviewFlow AI application (Next.js 15, App Router, React 19, TypeScript strict, Tailwind CSS v4). See [`apps/README.md`](../README.md) for how this fits into the monorepo.

## Development

From the repository root:

```bash
pnpm install
pnpm --filter @reviewflow/web dev
```

The app runs at `http://localhost:3000` (or the next available port).

## Scripts

```bash
pnpm --filter @reviewflow/web dev        # Start dev server (Turbopack)
pnpm --filter @reviewflow/web build      # Production build
pnpm --filter @reviewflow/web lint       # Lint
pnpm --filter @reviewflow/web typecheck  # Type check
```

## Structure

```text
src/
  app/          # App Router routes, layouts, and route handlers
  components/   # App-specific components (shared components live in @reviewflow/ui)
  hooks/        # App-specific React hooks
  lib/          # App-specific non-component logic
  styles/       # Additional stylesheets beyond app/globals.css
```

## Shared packages

This app consumes `@reviewflow/{ui,config,types,utils,database,logger,errors,supabase}` as workspace dependencies (see [`next.config.mjs`](./next.config.mjs) `transpilePackages`). See [`packages/README.md`](../../packages/README.md) for what belongs in each.
