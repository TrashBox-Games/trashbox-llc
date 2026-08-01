import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { setPendingSignupPassword } from "@/lib/portal-auth";
import { ConfirmForm } from "./ConfirmForm";

const confirmSignUpCode = vi.fn();
const signInWithPassword = vi.fn();
const assign = vi.fn();

describe("ConfirmForm", () => {
  beforeEach(() => {
    confirmSignUpCode.mockReset();
    signInWithPassword.mockReset();
    assign.mockReset();
    sessionStorage.clear();
    confirmSignUpCode.mockResolvedValue(undefined);
    signInWithPassword.mockResolvedValue(undefined);
    vi.stubGlobal("location", {
      ...window.location,
      assign,
      search: "?email=owner%40example.com",
    });
  });

  it("auto signs in when pending password is available", async () => {
    setPendingSignupPassword("owner@example.com", "password123");
    const user = userEvent.setup();
    render(
      <StubAuthProvider
        value={{
          status: "signedOut",
          configured: true,
          confirmSignUpCode,
          signInWithPassword,
        }}
      >
        <ConfirmForm />
      </StubAuthProvider>,
    );

    await user.type(screen.getByLabelText(/verification code/i), "123456");
    await user.click(screen.getByRole("button", { name: /confirm email/i }));

    expect(confirmSignUpCode).toHaveBeenCalledWith(
      "owner@example.com",
      "123456",
    );
    expect(signInWithPassword).toHaveBeenCalledWith(
      "owner@example.com",
      "password123",
    );
    expect(assign).toHaveBeenCalledWith("/portal/");
  });

  it("sends to login when password was lost", async () => {
    const user = userEvent.setup();
    render(
      <StubAuthProvider
        value={{
          status: "signedOut",
          configured: true,
          confirmSignUpCode,
          signInWithPassword,
        }}
      >
        <ConfirmForm />
      </StubAuthProvider>,
    );

    await user.type(screen.getByLabelText(/verification code/i), "123456");
    await user.click(screen.getByRole("button", { name: /confirm email/i }));

    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith("/portal/login/");
  });
});
