import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortalProvider } from "@/lib/portal";
import { PortalApp } from "./PortalPage";

vi.mock("next/navigation", () => ({
  usePathname: () => "/platform/",
}));

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    getAccount: vi.fn(),
    getMailbox: vi.fn().mockResolvedValue({ connected: false }),
    getTeam: vi.fn().mockResolvedValue({
      clientId: "c1",
      clientName: "Test",
      role: "owner",
      permissions: [
        "manage_sender_display_names",
        "allow_all_sender_display_names",
        "manage_team_members",
        "manage_roles_and_permissions",
        "manage_api_keys",
      ],
      roles: [],
      members: [],
      invites: [],
      memberLimit: 1,
      memberCount: 1,
    }),
    listSubmissions: vi.fn(),
    listLeadMessages: vi.fn().mockResolvedValue({ submissionId: "", items: [] }),
    provisionAccount: vi.fn(),
    startCheckout: vi.fn(),
    openBillingPortal: vi.fn(),
  };
});

vi.mock("@/components/atoms/FadeIn", () => ({
  FadeIn: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

import { useAuth } from "@/lib/auth";
import { getAccount, listSubmissions } from "@/lib/api";

describe("PortalProvider session", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      configured: true,
      status: "signedIn",
      email: "owner@example.com",
      signInWithPassword: vi.fn(),
      signUpWithPassword: vi.fn(),
      confirmSignUpCode: vi.fn(),
      resendCode: vi.fn(),
      signOutUser: vi.fn(),
    } as ReturnType<typeof useAuth>);

    vi.mocked(getAccount).mockResolvedValue({
      linked: true,
      email: "owner@example.com",
      clientName: "Acme",
      tier: "basic",
      active: true,
      hasBilling: false,
      hasApiKey: true,
      role: "owner",
    });
    vi.mocked(listSubmissions).mockResolvedValue({
      clientId: "c1",
      clientName: "Acme",
      items: [],
    });
    vi.mocked(getAccount).mockClear();
    vi.mocked(listSubmissions).mockClear();
  });

  it("keeps account data across tab changes without re-fetching", async () => {
    const { rerender } = render(
      <PortalProvider>
        <PortalApp tab="inbox" />
      </PortalProvider>,
    );

    await waitFor(() => {
      expect(getAccount).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.queryByRole("heading", { name: /lead inbox/i }),
    ).not.toBeInTheDocument();

    rerender(
      <PortalProvider>
        <PortalApp tab="membership" />
      </PortalProvider>,
    );

    expect(
      await screen.findByRole("heading", {
        name: /no paid plan yet|basic|premium/i,
      }),
    ).toBeInTheDocument();
    expect(getAccount).toHaveBeenCalledTimes(1);
    expect(listSubmissions).toHaveBeenCalledTimes(1);
  });
});
