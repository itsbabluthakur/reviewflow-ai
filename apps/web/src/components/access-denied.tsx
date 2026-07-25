import { ShieldAlertIcon } from "lucide-react";
import { EmptyState } from "./empty-state";

/**
 * Shown when a request reaches the protected layout with a valid session
 * but no agency membership — "authenticated without membership" per this
 * sprint's ERRORS spec. Distinct from the anonymous case (redirect to
 * /login), which never reaches this component.
 */
export function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <EmptyState
        icon={ShieldAlertIcon}
        title="Access denied"
        description="Your account isn't linked to an agency yet. Contact your administrator for access."
        className="max-w-sm"
      />
    </div>
  );
}
