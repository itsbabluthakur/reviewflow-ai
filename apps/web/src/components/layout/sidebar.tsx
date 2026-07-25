"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@reviewflow/ui";
import { cn } from "@reviewflow/utils";
import { COMING_SOON_ITEMS, NAV_ITEMS } from "./nav-items";

function SidebarBrand() {
  return (
    <div className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
        ReviewFlow AI
      </Link>
    </div>
  );
}

function SidebarNav({ onNavigate = () => {} }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-4" aria-label="Main">
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground px-2.5 text-xs font-medium">More (coming soon)</p>
        {COMING_SOON_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              type="button"
              disabled
              aria-disabled="true"
              className="text-muted-foreground/60 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm font-medium disabled:cursor-not-allowed"
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              <span className="border-border rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                Soon
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

/**
 * Desktop: a persistent left column (`md:flex`, hidden below that
 * breakpoint). Mobile/tablet: a slide-in drawer built on the same Dialog
 * primitive used elsewhere (focus trap, escape-to-close, overlay come for
 * free) — `SidebarNav` is the single source of nav items for both, so
 * there's exactly one place to update when a section is added.
 */
export function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  return (
    <>
      <aside className="border-border hidden w-60 shrink-0 flex-col border-r md:flex">
        <SidebarBrand />
        <SidebarNav />
      </aside>

      <Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="border-border data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left left-0 top-0 flex h-full w-72 max-w-[80vw] translate-x-0 translate-y-0 flex-col rounded-none border-r p-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <SidebarBrand />
          <SidebarNav onNavigate={() => onMobileOpenChange(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
