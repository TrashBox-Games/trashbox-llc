import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { SignupForm } from "./SignupForm";

const signUpWithPassword = vi.fn();
const assign = vi.fn();

describe("SignupForm", () => {
  beforeEach(() => {
    signUpWithPassword.mockReset();
    assign.mockReset();
    sessionStorage.clear();
    vi.stubGlobal("location", {
      ...window.location,
      assign,
    });
  });

  it("rejects mismatched passwords", async () => {
    const user = userEvent.setup();
    render(
      <StubAuthProvider
        value={{
          status: "signedOut",
          configured: true,
          signUpWithPassword,
        }}
      >
        <SignupForm />
      </StubAuthProvider>,
    );

    await user.type(screen.getByLabelText(/^email$/i), "owner@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "different");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(signUpWithPassword).not.toHaveBeenCalled();
  });

  it("redirects to confirm after signup requiring verification", async () => {
    signUpWithPassword.mockResolvedValue("confirm");
    const user = userEvent.setup();
    render(
      <StubAuthProvider
        value={{
          status: "signedOut",
          configured: true,
          signUpWithPassword,
        }}
      >
        <SignupForm />
      </StubAuthProvider>,
    );

    await user.type(screen.getByLabelText(/^email$/i), "Owner@Example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(signUpWithPassword).toHaveBeenCalledWith(
      "Owner@Example.com",
      "password123",
    );
    expect(assign).toHaveBeenCalledWith(
      "/portal/confirm/?email=owner%40example.com",
    );
  });
});
