"use server";

import { forgotPasswordSchema } from "@reviewflow/validation";
import { createLogger } from "@reviewflow/logger";
import { getAuthContext } from "../../lib/auth-context";

const logger = createLogger({ module: "forgot-password-action" });

export interface ForgotPasswordActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: { email?: string };
}

/**
 * Always resolves to the same success message regardless of whether the
 * email is registered — `AuthService.requestPasswordReset` itself never
 * throws, for the same reason (SECURITY.md section 2, "no user
 * enumeration"). Any unexpected failure is logged, not shown to the user.
 */
export async function forgotPasswordAction(
  _prevState: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: { email: parsed.error.issues[0]?.message ?? "Enter a valid email address." },
    };
  }

  try {
    const { authService } = await getAuthContext();
    await authService.requestPasswordReset(parsed.data.email);
  } catch (error) {
    logger.error({ err: error }, "password reset request failed unexpectedly");
  }

  return {
    status: "success",
    message: "If an account exists for that email, we've sent a password reset link.",
  };
}
