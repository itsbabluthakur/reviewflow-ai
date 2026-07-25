import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SignupForm } from "./signup-form";
import type { SignupActionState } from "./actions";

const signupActionMock = vi.hoisted(() => vi.fn());
vi.mock("./actions", () => ({ signupAction: signupActionMock }));

describe("SignupForm", () => {
  it("renders full name, email, password, and confirm password fields", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
  });

  it("shows a loading state on the submit button while pending", async () => {
    let resolveAction!: (state: SignupActionState) => void;
    signupActionMock.mockReturnValue(
      new Promise<SignupActionState>((resolve) => {
        resolveAction = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2");
    await user.type(screen.getByLabelText("Confirm password"), "hunter2hunter2");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("button", { name: /creating account/i })).toBeDisabled();

    resolveAction({ status: "idle" });
  });

  it("displays field-level validation errors returned by the action", async () => {
    signupActionMock.mockResolvedValue({
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: { confirmPassword: "Passwords do not match." },
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2");
    await user.type(screen.getByLabelText("Confirm password"), "somethingElse123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
  });
});
