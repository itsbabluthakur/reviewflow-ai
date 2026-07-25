import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";
import type { LoginActionState } from "./actions";

const loginActionMock = vi.hoisted(() => vi.fn());
vi.mock("./actions", () => ({ loginAction: loginActionMock }));

describe("LoginForm", () => {
  it("renders email and password fields with a forgot-password link", () => {
    render(<LoginForm redirectTo="/dashboard" />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("shows a loading state on the submit button while pending", async () => {
    let resolveAction!: (state: LoginActionState) => void;
    loginActionMock.mockReturnValue(
      new Promise<LoginActionState>((resolve) => {
        resolveAction = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<LoginForm redirectTo="/dashboard" />);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("button", { name: /logging in/i })).toBeDisabled();

    resolveAction({ status: "idle" });
  });

  it("displays a generic error message returned by the action", async () => {
    loginActionMock.mockResolvedValue({ status: "error", message: "Invalid email or password." });

    const user = userEvent.setup();
    render(<LoginForm redirectTo="/dashboard" />);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
  });
});
