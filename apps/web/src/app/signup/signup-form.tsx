"use client";

import { useActionState } from "react";
import { Input } from "@reviewflow/ui";
import { FormField } from "../../components/forms/form-field";
import { SubmitButton } from "../../components/forms/submit-button";
import { signupAction, type SignupActionState } from "./actions";

const initialState: SignupActionState = { status: "idle" };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FormField id="fullName" label="Full name" error={state.fieldErrors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
          aria-describedby={state.fieldErrors?.fullName ? "fullName-error" : undefined}
        />
      </FormField>

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
        hint={<span className="text-muted-foreground text-xs">At least 12 characters</span>}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
      </FormField>

      <FormField
        id="confirmPassword"
        label="Confirm password"
        error={state.fieldErrors?.confirmPassword}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          aria-describedby={
            state.fieldErrors?.confirmPassword ? "confirmPassword-error" : undefined
          }
        />
      </FormField>

      {state.status === "error" && state.message && !state.fieldErrors ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <SubmitButton pending={isPending} pendingLabel="Creating account…" className="w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
