"use client";

import { useEffect } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@reviewflow/ui";
import { EmptyState } from "../components/empty-state";

/**
 * Generic 500 boundary — friendly message + retry, per UI_GUIDELINES
 * section 20 ("do not expose technical details to users"). By the time an
 * error reaches here it's genuinely unexpected: known failure modes
 * (unauthenticated, no membership) are branched on server-side in
 * app/(protected)/layout.tsx before they'd ever reach this boundary.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <EmptyState
        icon={AlertTriangleIcon}
        title="Something went wrong"
        description="An unexpected error occurred. Please try again."
        action={<Button onClick={reset}>Try again</Button>}
        className="max-w-sm"
      />
    </div>
  );
}
