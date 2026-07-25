import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reviewflow/ui";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password — ReviewFlow AI",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        ReviewFlow AI
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
