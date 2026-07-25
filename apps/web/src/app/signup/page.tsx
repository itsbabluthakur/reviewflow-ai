import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reviewflow/ui";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up — ReviewFlow AI",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        ReviewFlow AI
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Start managing your reputation with ReviewFlow AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
