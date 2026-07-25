import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("NotFound (404 page)", () => {
  it("shows a friendly message and a way home", () => {
    render(<NotFound />);

    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/");
  });
});
