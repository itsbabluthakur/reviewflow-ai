"use client";

import { useActionState } from "react";
import { Input } from "@reviewflow/ui";
import { FormField } from "../../components/forms/form-field";
import { SubmitButton } from "../../components/forms/submit-button";
import { forgotPasswordAction, type ForgotPasswordActionState } from "./actions";

const initialState: ForgotPasswordActionState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  if (state.status === "success") {
    return (
      <p role="status" className="text-sm">
        {state.message}
      </p>
    );
  }

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

      {state.status === "error" && state.message && !state.fieldErrors?.email ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <SubmitButton pending={isPending} pendingLabel="Sending…" className="w-full">
        Send reset link
      </SubmitButton>
    </form>
  );
}
