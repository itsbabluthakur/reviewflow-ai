import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reviewflow/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in — ReviewFlow AI",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        ReviewFlow AI
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Log in</CardTitle>
          <CardDescription>Welcome back — enter your details to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirect ?? "/dashboard"} />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}
