import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders the title and optional description", () => {
    render(<PageHeader title="Dashboard" description="Overview of your agency." />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Overview of your agency.")).toBeInTheDocument();
  });

  it("omits the description when none is given", () => {
    render(<PageHeader title="Settings" />);

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
  });

  it("renders provided actions", () => {
    render(<PageHeader title="Dashboard" actions={<button type="button">Action</button>} />);

    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
