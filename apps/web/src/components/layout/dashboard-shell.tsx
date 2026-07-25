"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface DashboardShellProps {
  agencyName: string;
  fullName: string;
  email: string;
  copyrightYear: number;
  children: React.ReactNode;
}

/**
 * Desktop/tablet/mobile responsive shell: fixed sidebar + navbar + scrolling
 * content + footer. `copyrightYear` is computed server-side and passed in
 * (rather than `new Date().getFullYear()` here) so server and client render
 * identical markup — no hydration mismatch risk.
 */
export function DashboardShell({
  agencyName,
  fullName,
  email,
  copyrightYear,
  children,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar
          agencyName={agencyName}
          fullName={fullName}
          email={email}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        <footer className="border-border text-muted-foreground border-t px-4 py-4 text-xs md:px-6 lg:px-8">
          © {copyrightYear} ReviewFlow AI
        </footer>
      </div>
    </div>
  );
}
