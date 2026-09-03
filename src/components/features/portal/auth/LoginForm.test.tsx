import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

const signInWithPassword = vi.fn();

describe("LoginForm", () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
    signInWithPassword.mockResolvedValue(undefined);
    vi.stubGlobal("location", {
      ...window.location,
      search: "",
    });
  });

  it("prefills email and keeps it on the signup link", async () => {
    vi.stubGlobal("location", {
      ...window.location,
      search: "?email=Owner%40Example.com",
    });
    render(
      <StubAuthProvider
        value={{ status: "signedOut", configured: true, signInWithPassword }}
      >
        <LoginForm />
      </StubAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toHaveValue("Owner@Example.com");
    });
    expect(
      screen.getByRole("link", { name: /sign up/i }).getAttribute("href"),
    ).toMatch(/email=Owner%40Example.com/);
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
