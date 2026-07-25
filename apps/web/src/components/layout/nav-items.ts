import type { LucideIcon } from "lucide-react";
import {
  BarChart3Icon,
  Building2Icon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  SettingsIcon,
  StarIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

/** Real, navigable sections — this sprint's application shell. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Account", href: "/account", icon: UserIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

/** Future business features — rendered disabled, labeled "Coming soon" (see docs/architecture/0006-application-shell.md). */
export const COMING_SOON_ITEMS: NavItem[] = [
  { label: "Reviews", href: "/reviews", icon: StarIcon, comingSoon: true },
  { label: "Customers", href: "/customers", icon: UsersIcon, comingSoon: true },
  { label: "Businesses", href: "/businesses", icon: Building2Icon, comingSoon: true },
  { label: "Campaigns", href: "/campaigns", icon: MegaphoneIcon, comingSoon: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3Icon, comingSoon: true },
];
