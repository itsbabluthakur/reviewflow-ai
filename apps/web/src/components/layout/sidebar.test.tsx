import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Sidebar", () => {
  it("renders the real nav items as links", () => {
    render(<Sidebar mobileOpen={false} onMobileOpenChange={() => {}} />);

    for (const label of ["Dashboard", "Account", "Settings"]) {
      const links = screen.getAllByRole("link", { name: label });
      expect(links.length).toBeGreaterThan(0);
    }
  });

  it("marks the current route as the active page", () => {
    render(<Sidebar mobileOpen={false} onMobileOpenChange={() => {}} />);

    const dashboardLinks = screen.getAllByRole("link", { name: "Dashboard" });
    expect(dashboardLinks[0]).toHaveAttribute("aria-current", "page");
  });

  it("renders future items as disabled buttons labeled 'Soon'", () => {
    render(<Sidebar mobileOpen={false} onMobileOpenChange={() => {}} />);

    for (const label of ["Reviews", "Customers", "Businesses", "Campaigns", "Analytics"]) {
      const buttons = screen.getAllByRole("button", { name: new RegExp(label) });
      expect(buttons[0]).toBeDisabled();
    }
    expect(screen.getAllByText("Soon").length).toBeGreaterThan(0);
  });
});
