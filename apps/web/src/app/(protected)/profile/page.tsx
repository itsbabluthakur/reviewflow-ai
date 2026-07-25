import type { Metadata } from "next";
import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@reviewflow/ui";
import { PageHeader } from "../../../components/page-header";
import { getDashboardContext } from "../../../lib/dashboard-context";
import { initials } from "../../../lib/initials";

export const metadata: Metadata = {
  title: "Profile — ReviewFlow AI",
};

export default async function ProfilePage() {
  const { user } = await getDashboardContext();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Profile" description="Your personal information." />
      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-base">{initials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.fullName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Editing your profile is coming soon.
        </CardContent>
      </Card>
    </div>
  );
}
