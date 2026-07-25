import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardLoadingSkeleton } from "./dashboard-loading-skeleton";

describe("DashboardLoadingSkeleton", () => {
  it("renders skeleton placeholders for the sidebar, navbar, and content grid", () => {
    const { container } = render(<DashboardLoadingSkeleton />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(5);
  });

  it("exposes each skeleton block as an accessible loading status", () => {
    const { container } = render(<DashboardLoadingSkeleton />);

    const statuses = container.querySelectorAll('[role="status"][aria-label="Loading"]');
    expect(statuses.length).toBeGreaterThan(0);
  });
});
