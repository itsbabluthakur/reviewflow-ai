import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UserMenu } from "./user-menu";

const signOutActionMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock("../../lib/sign-out-action", () => ({ signOutAction: signOutActionMock }));

describe("UserMenu", () => {
  it("shows the user's initials as the trigger", () => {
    render(<UserMenu fullName="Ada Lovelace" email="ada@example.com" />);

    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("opens to reveal Profile, Account, Settings, and Log out", async () => {
    const user = userEvent.setup();
    render(<UserMenu fullName="Ada Lovelace" email="ada@example.com" />);

    await user.click(screen.getByRole("button", { name: /account menu/i }));

    expect(await screen.findByRole("menuitem", { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /log out/i })).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("calls packages/auth's signOut action when Log out is selected", async () => {
    const user = userEvent.setup();
    render(<UserMenu fullName="Ada Lovelace" email="ada@example.com" />);

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    await user.click(await screen.findByRole("menuitem", { name: /log out/i }));

    expect(signOutActionMock).toHaveBeenCalledTimes(1);
  });
});
