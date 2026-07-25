import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "./navbar";

vi.mock("../../lib/sign-out-action", () => ({ signOutAction: vi.fn() }));

describe("Navbar", () => {
  it("displays the agency name", () => {
    render(
      <Navbar
        agencyName="Acme Agency"
        fullName="Ada Lovelace"
        email="ada@example.com"
        onMenuClick={() => {}}
      />,
    );

    expect(screen.getByText("Acme Agency")).toBeInTheDocument();
  });

  it("renders search/theme/notifications as disabled placeholders", () => {
    render(
      <Navbar
        agencyName="Acme Agency"
        fullName="Ada Lovelace"
        email="ada@example.com"
        onMenuClick={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /search/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /notifications/i })).toBeDisabled();
  });

  it("calls onMenuClick when the mobile menu button is pressed", async () => {
    const user = userEvent.setup();
    const onMenuClick = vi.fn();
    render(
      <Navbar
        agencyName="Acme Agency"
        fullName="Ada Lovelace"
        email="ada@example.com"
        onMenuClick={onMenuClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: /open navigation menu/i }));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("includes the user menu trigger", () => {
    render(
      <Navbar
        agencyName="Acme Agency"
        fullName="Ada Lovelace"
        email="ada@example.com"
        onMenuClick={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: /account menu for ada lovelace/i }),
    ).toBeInTheDocument();
  });
});
