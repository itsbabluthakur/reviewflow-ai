# @reviewflow/validation

## Purpose

Shared Zod schemas for forms and API payloads used across ReviewFlow AI apps. Consumed via the `@reviewflow/validation` workspace import.

## What belongs here

- Zod schemas shared by a form's client-side validation and its server-side handler (Server Action / Route Handler), so the two never drift — `src/auth.ts`'s `loginSchema`/`signupSchema` are the first example, used by both `apps/web`'s login/signup forms and their Server Actions.

## What should NOT be placed here

- Environment variable schemas — each package validates its own via `@reviewflow/config`'s `parseEnv` (see `packages/database/src/env.ts`, `packages/supabase/src/env.ts`).
- Database schema — that's Drizzle's job, in `@reviewflow/database`.
- Business logic — a schema validates shape, it doesn't decide what happens with valid data.

## Usage

```ts
import { loginSchema, signupSchema } from "@reviewflow/validation";

const parsed = loginSchema.safeParse({ email, password });
if (!parsed.success) {
  // parsed.error.issues — one per invalid field
}
```

## Design notes

- `signupSchema`'s password minimum (12 characters) matches `SECURITY.md` section 13's password policy — kept in exactly one place so client and server validation can never disagree.
- `confirmPassword` mismatches attach their error to the `confirmPassword` field specifically (via Zod's `refine` + `path`), so a form can show it under the right input.
