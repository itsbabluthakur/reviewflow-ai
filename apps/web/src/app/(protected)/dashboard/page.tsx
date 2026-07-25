import type { Metadata } from "next";
import { ActivityIcon, PlusIcon } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@reviewflow/ui";
import { PageHeader } from "../../../components/page-header";
import { Section } from "../../../components/section";
import { EmptyState } from "../../../components/empty-state";
import { getDashboardContext } from "../../../lib/dashboard-context";

export const metadata: Metadata = {
  title: "Dashboard — ReviewFlow AI",
};

/**
 * Deliberately not a business dashboard — scaffold UI only, per this
 * sprint's scope. Welcome/agency/role/email are real data; recent activity
 * and quick actions are empty/disabled placeholders future features fill
 * in. See docs/architecture/0006-application-shell.md.
 */
export default async function DashboardPage() {
  const { user, agency, membership } = await getDashboardContext();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <PageHeader
        title={`Welcome, ${user.fullName}`}
        description={`${agency.name} · ${membership.role}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">Agency</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">{agency.name}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">Your role</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium capitalize">{membership.role}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Signed in as
            </CardTitle>
          </CardHeader>
          <CardContent className="truncate text-lg font-medium">{user.email}</CardContent>
        </Card>
      </div>

      <Section title="Recent activity">
        <EmptyState
          icon={ActivityIcon}
          title="No activity yet"
          description="Once you start collecting reviews and running campaigns, recent activity will show up here."
        />
      </Section>

      <Section
        title="Quick actions"
        description="Coming soon — these will light up as features ship."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled>
            <PlusIcon /> Add customer
          </Button>
          <Button variant="outline" disabled>
            <PlusIcon /> Send review request
          </Button>
          <Button variant="outline" disabled>
            <PlusIcon /> Create campaign
          </Button>
        </div>
      </Section>
    </div>
  );
}
