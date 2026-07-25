import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@reviewflow/ui";
import { PageHeader } from "../../../components/page-header";
import { getDashboardContext } from "../../../lib/dashboard-context";

export const metadata: Metadata = {
  title: "Settings — ReviewFlow AI",
};

export default async function SettingsPage() {
  const { user } = await getDashboardContext();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Settings" description="Preferences for your account." />
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Signed in as {user.email}. These preferences are coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between opacity-60">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-muted-foreground text-xs">Light, dark, or system</p>
            </div>
            <span className="text-muted-foreground text-xs">Coming soon</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between opacity-60">
            <div>
              <p className="text-sm font-medium">Email notifications</p>
              <p className="text-muted-foreground text-xs">Product updates and account alerts</p>
            </div>
            <span className="text-muted-foreground text-xs">Coming soon</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
