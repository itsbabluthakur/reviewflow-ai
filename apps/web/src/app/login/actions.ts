"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@reviewflow/validation";
import { isSafeRedirectPath } from "@reviewflow/auth";
import { AuthenticationError } from "@reviewflow/errors";
import { createLogger } from "@reviewflow/logger";
import { getAuthContext } from "../../lib/auth-context";

const logger = createLogger({ module: "login-action" });

export interface LoginActionState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: { email?: string; password?: string };
}

/**
 * Bound with `redirectTo` by the client form (`loginAction.bind(null, redirectTo)`)
 * so `useActionState` sees the standard `(prevState, formData)` signature.
 * Never reveals whether the failure was an unknown email or a wrong
 * password — always the same generic message (SECURITY.md section 2,
 * "no user enumeration"; see ADR-0005).
 */
export async function loginAction(
  redirectTo: string,
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "email" || field === "password") {
        fieldErrors[field] = issue.message;
      }
    }
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  const { authService } = await getAuthContext();

  try {
    await authService.signIn(parsed.data);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { status: "error", message: "Invalid email or password." };
    }
    logger.error({ err: error }, "login failed unexpectedly");
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  redirect(isSafeRedirectPath(redirectTo) ? redirectTo : "/dashboard");
}
