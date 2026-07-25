import { redirect } from "next/navigation";
import { AuthenticationError, AuthorizationError } from "@reviewflow/errors";
import { DashboardShell } from "../../components/layout/dashboard-shell";
import { AccessDenied } from "../../components/access-denied";
import { getDashboardContext } from "../../lib/dashboard-context";

/**
 * Shared shell for every protected route (/dashboard, /account, /settings,
 * /profile). Resolves the current user/agency/membership once per request
 * (see getDashboardContext) and branches on the two expected failure modes
 * *before* they'd otherwise reach the generic error boundary — Next.js
 * strips custom error subclasses down to a generic Error by the time
 * error.tsx sees them in production, so `instanceof` checks belong here,
 * in the Server Component, not there. See
 * docs/architecture/0006-application-shell.md.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  try {
    const { user, agency } = await getDashboardContext();
    return (
      <DashboardShell
        agencyName={agency.name}
        fullName={user.fullName}
        email={user.email}
        copyrightYear={new Date().getFullYear()}
      >
        {children}
      </DashboardShell>
    );
  } catch (error) {
    // Middleware already verifies a session before this layout ever runs;
    // this only fires if the session expired in the moment between that
    // check and this render. Redirecting to /login (not throwing) matches
    // "Unauthorized users → Redirect login".
    if (error instanceof AuthenticationError) {
      redirect("/login");
    }
    // "Authenticated without membership → Friendly access denied".
    if (error instanceof AuthorizationError) {
      return <AccessDenied />;
    }
    throw error;
  }
}
