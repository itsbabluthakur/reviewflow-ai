import { z } from "zod";

/** SECURITY.md section 13 (Password Policy): minimum 12 characters. */
const MIN_PASSWORD_LENGTH = 12;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(1, "Enter your full name."),
    email: z.email("Enter a valid email address."),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
