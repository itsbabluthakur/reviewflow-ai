"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOutIcon, SettingsIcon, UserIcon, UserRoundIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@reviewflow/ui";
import { signOutAction } from "../../lib/sign-out-action";
import { initials } from "../../lib/initials";

export function UserMenu({ fullName, email }: { fullName: string; email: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus-visible:ring-ring/50 focus-visible:ring-3 rounded-full outline-none"
        aria-label={`Account menu for ${fullName}`}
      >
        <Avatar>
          <AvatarFallback>{initials(fullName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="text-foreground text-sm font-medium">{fullName}</span>
          <span className="text-muted-foreground text-xs">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRoundIcon /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">
            <UserIcon /> Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <SettingsIcon /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onSelect={() => {
            startTransition(() => {
              void signOutAction();
            });
          }}
        >
          <LogOutIcon /> {isPending ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
