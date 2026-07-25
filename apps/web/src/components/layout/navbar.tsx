"use client";

import { BellIcon, MenuIcon, SearchIcon, SunMoonIcon } from "lucide-react";
import { Button } from "@reviewflow/ui";
import { UserMenu } from "./user-menu";

interface NavbarProps {
  agencyName: string;
  fullName: string;
  email: string;
  onMenuClick: () => void;
}

/**
 * Search/theme-toggle/notifications are deliberate placeholders this
 * sprint — disabled, non-functional, but present so the shell reads as a
 * finished product rather than a work in progress. See
 * docs/architecture/0006-application-shell.md.
 */
export function Navbar({ agencyName, fullName, email, onMenuClick }: NavbarProps) {
  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <MenuIcon />
      </Button>

      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium" title={agencyName}>
          {agencyName}
        </span>
      </div>

      <Button type="button" variant="ghost" size="icon" disabled aria-label="Search (coming soon)">
        <SearchIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        aria-label="Toggle theme (coming soon)"
      >
        <SunMoonIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        aria-label="Notifications (coming soon)"
      >
        <BellIcon />
      </Button>

      <UserMenu fullName={fullName} email={email} />
    </header>
  );
}
