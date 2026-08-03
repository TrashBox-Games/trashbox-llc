import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/components/ui/sonner";
import { PortalProvider } from "@/lib/portal";

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    getAccount: vi.fn().mockResolvedValue({
      linked: true,
      email: "owner@example.com",
      clientName: "Acme",
      tier: "free",
      active: true,
      hasBilling: false,
      hasApiKey: true,
      role: "owner",
    }),
    getMailbox: vi.fn().mockResolvedValue({ connected: false }),
    listOrgs: vi.fn().mockResolvedValue({ orgs: [] }),
    listForms: vi.fn().mockResolvedValue({ forms: [], canManage: false }),
    getTeam: vi.fn().mockResolvedValue({
      clientId: "c1",
      clientName: "Test",
      role: "owner",
      permissions: [],
      roles: [],
      members: [],
      invites: [],
      memberLimit: 1,
      memberCount: 1,
    }),
    listSubmissions: vi.fn().mockResolvedValue({
      clientId: "c1",
      clientName: "Acme",
      items: [],
    }),
    listLeadMessages: vi
      .fn()
      .mockResolvedValue({ submissionId: "", items: [] }),
    acceptTeamInvite: vi.fn(),
  };
});

import { useAuth } from "@/lib/auth";

describe("PortalProvider notice toasts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/portal/");
    vi.mocked(useAuth).mockReturnValue({
      configured: true,
      status: "signedIn",
      email: "owner@example.com",
      signInWithPassword: vi.fn(),
      signUpWithPassword: vi.fn(),
      confirmSignUpCode: vi.fn(),
      resendCode: vi.fn(),
      requestPasswordReset: vi.fn(),
      confirmForgotPassword: vi.fn(),
      signOutUser: vi.fn(),
      refresh: vi.fn(),
    } as ReturnType<typeof useAuth>);
  });

  it("toasts when mailbox connects via URL flash", async () => {
    window.history.replaceState({}, "", "/portal/?mailbox=connected");

    render(
      <PortalProvider disableAuthRedirect>
        <div />
      </PortalProvider>,
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Mailbox connected successfully.",
      );
    });
    expect(window.location.search).not.toContain("mailbox=");
  });

  it("toasts billing cancel via URL flash as a message", async () => {
    window.history.replaceState({}, "", "/portal/?billing=cancel");

    render(
      <PortalProvider disableAuthRedirect>
        <div />
      </PortalProvider>,
    );

    await waitFor(() => {
      expect(toast.message).toHaveBeenCalledWith(
        "Checkout canceled. Your plan was not changed.",
      );
    });
  });

  it("toasts billing success via URL flash", async () => {
    window.history.replaceState({}, "", "/portal/?billing=success");

    render(
      <PortalProvider disableAuthRedirect>
        <div />
      </PortalProvider>,
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Billing updated. Plan status refreshes after Stripe confirms payment.",
      );
    });
  });
});
