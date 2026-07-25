import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { Button } from "@reviewflow/ui";
import { EmptyState } from "../components/empty-state";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <EmptyState
        icon={CompassIcon}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        }
        className="max-w-sm"
      />
    </div>
  );
}
