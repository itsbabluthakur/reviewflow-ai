import Link from "next/link";
import { Button } from "@reviewflow/ui";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <span className="text-lg font-semibold tracking-tight">ReviewFlow AI</span>
        <nav className="flex items-center gap-2" aria-label="Account">
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">ReviewFlow AI</h1>
        <p className="text-muted-foreground max-w-md text-lg">
          Collect more reviews. Build trust. Grow faster.
        </p>
        <div className="mt-2 flex gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
