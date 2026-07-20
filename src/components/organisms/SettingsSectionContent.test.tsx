import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortalProvider } from "@/lib/portal";
import { SettingsSectionContent } from "./SettingsSectionContent";

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
      clientName: "Acme",
      role: "owner",
      members: [
        {
          email: "owner@example.com",
          role: "owner",
          joinedAt: "2026-01-01T00:00:00.000Z",
          emailNotifications: true,
        },
      ],
      invites: [],
      memberLimit: 5,
      memberCount: 1,
    }),
    listSubmissions: vi.fn().mockResolvedValue({
      clientId: "c1",
      clientName: "Acme",
      items: [],
    }),
    listLeadMessages: vi.fn().mockResolvedValue({ submissionId: "", items: [] }),
  };
});

vi.mock("@/components/atoms/FadeIn", () => ({
  FadeIn: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

import { useAuth } from "@/lib/auth";
import { getAccount } from "@/lib/api";

describe("SettingsSectionContent", () => {
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
      tier: "premium",
      active: true,
      hasBilling: true,
      hasApiKey: true,
      role: "owner",
    });
  });

  it("renders team members management in the members section", async () => {
    render(
      <PortalProvider>
        <SettingsSectionContent sectionId="members" />
      </PortalProvider>,
    );

    expect(
      await screen.findByText(/owner@example.com/i),
    ).toBeInTheDocument();
  });
});
