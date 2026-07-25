import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reviewflow/ui";
import { PageHeader } from "../../../components/page-header";
import { getDashboardContext } from "../../../lib/dashboard-context";

export const metadata: Metadata = {
  title: "Account — ReviewFlow AI",
};

export default async function AccountPage() {
  const { user, agency, membership } = await getDashboardContext();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Account" description="Your account details." />
      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Editing account details is coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs">Email</dt>
              <dd className="text-sm font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Agency</dt>
              <dd className="text-sm font-medium">{agency.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Role</dt>
              <dd className="text-sm font-medium capitalize">{membership.role}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Member since</dt>
              <dd className="text-sm font-medium">
                {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(user.createdAt)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
