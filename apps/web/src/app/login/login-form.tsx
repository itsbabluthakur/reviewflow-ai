"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@reviewflow/ui";
import { FormField } from "../../components/forms/form-field";
import { SubmitButton } from "../../components/forms/submit-button";
import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = { status: "idle" };

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const boundAction = loginAction.bind(null, redirectTo);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FormField id="email" label="Email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
      </FormField>

      <FormField
        id="password"
        label="Password"
        error={state.fieldErrors?.password}
        hint={
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
          >
            Forgot password?
          </Link>
        }
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
      </FormField>

      {state.status === "error" && state.message && !state.fieldErrors ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <SubmitButton pending={isPending} pendingLabel="Logging in…" className="w-full">
        Log in
      </SubmitButton>
    </form>
  );
}
