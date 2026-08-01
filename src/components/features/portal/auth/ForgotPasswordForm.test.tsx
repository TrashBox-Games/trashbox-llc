import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

const requestPasswordReset = vi.fn();
const confirmForgotPassword = vi.fn();
const assign = vi.fn();

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    requestPasswordReset.mockReset();
    confirmForgotPassword.mockReset();
    assign.mockReset();
    requestPasswordReset.mockResolvedValue(undefined);
    confirmForgotPassword.mockResolvedValue(undefined);
    vi.stubGlobal("location", {
      ...window.location,
      assign,
    });
  });

  it("requests a reset code then confirms a new password", async () => {
    const user = userEvent.setup();
    render(
      <StubAuthProvider
        value={{
          status: "signedOut",
          configured: true,
          requestPasswordReset,
          confirmForgotPassword,
        }}
      >
        <ForgotPasswordForm />
      </StubAuthProvider>,
    );

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.click(screen.getByRole("button", { name: /send reset code/i }));
    expect(requestPasswordReset).toHaveBeenCalledWith("owner@example.com");

    await user.type(screen.getByLabelText(/reset code/i), "654321");
    await user.type(screen.getByLabelText(/^new password$/i), "password456");
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "password456",
    );
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(confirmForgotPassword).toHaveBeenCalledWith(
      "owner@example.com",
      "654321",
      "password456",
    );
    expect(assign).toHaveBeenCalledWith("/portal/login/");
  });
});
