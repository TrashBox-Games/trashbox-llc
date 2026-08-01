import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

const signInWithPassword = vi.fn();

describe("LoginForm", () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
    signInWithPassword.mockResolvedValue(undefined);
  });

  it("signs in with email and password", async () => {
    const user = userEvent.setup();
    render(
      <StubAuthProvider
        value={{
          status: "signedOut",
          configured: true,
          signInWithPassword,
        }}
      >
        <LoginForm />
      </StubAuthProvider>,
    );

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(signInWithPassword).toHaveBeenCalledWith(
      "owner@example.com",
      "password123",
    );
  });

  it("links to signup and forgot password", () => {
    render(
      <StubAuthProvider
        value={{ status: "signedOut", configured: true, signInWithPassword }}
      >
        <LoginForm />
      </StubAuthProvider>,
    );

    expect(
      screen.getByRole("link", { name: /sign up/i }).getAttribute("href"),
    ).toMatch(/\/portal\/signup\/?$/);
    expect(
      screen
        .getByRole("link", { name: /forgot password/i })
        .getAttribute("href"),
    ).toMatch(/\/portal\/forgot-password\/?$/);
  });
});
