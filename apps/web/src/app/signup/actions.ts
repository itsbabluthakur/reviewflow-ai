"use server";

import { redirect } from "next/navigation";
import { signupSchema } from "@reviewflow/validation";
import { AuthenticationError } from "@reviewflow/errors";
import { createLogger } from "@reviewflow/logger";
import { getAuthContext } from "../../lib/auth-context";

const logger = createLogger({ module: "signup-action" });

export interface SignupActionState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}

/**
 * On success: creates the Supabase account, syncs the application user
 * (both inside `authService.signUp`), then redirects to `/dashboard` —
 * exactly the flow this sprint specifies. No agency/membership is created
 * here; that stays out of scope (see docs/architecture/0006-application-shell.md).
 */
export async function signupAction(
  _prevState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: SignupActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        field === "fullName" ||
        field === "email" ||
        field === "password" ||
        field === "confirmPassword"
      ) {
        fieldErrors[field] = issue.message;
      }
    }
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  const { authService } = await getAuthContext();
  const { fullName, email, password } = parsed.data;

  try {
    await authService.signUp({ fullName, email, password });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { status: "error", message: error.message };
    }
    logger.error({ err: error }, "signup failed unexpectedly");
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}
