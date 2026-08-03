import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { OrgSettingsSectionContent } from "./OrgSettingsSectionContent";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getTeam: vi.fn().mockResolvedValue({
      clientId: "p1",
      clientName: "Marketing",
      role: "owner",
      permissions: ["manage_team_members"],
      roles: [],
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
    getMailbox: vi.fn().mockResolvedValue({ connected: false }),
  };
});

const org = {
  orgId: "o1",
  orgName: "Acme Co",
  orgSlug: "acme-co",
  role: "owner" as const,
  tier: "free" as const,
  active: true,
  hasBilling: false,
  projects: [
    {
      projectId: "p1",
      projectName: "Marketing",
      projectSlug: "marketing",
    },
  ],
};

describe("OrgSettingsSectionContent", () => {
  it("renders general organization settings", () => {
    render(
      <StubAuthProvider
        value={{ status: "signedIn", configured: true, email: "owner@example.com" }}
      >
        <StubPortalProvider value={{ ready: true }}>
          <OrgSettingsSectionContent org={org} sectionId="general" />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
  });

  it("links members empty state to org home when there are no projects", () => {
    render(
      <StubAuthProvider
        value={{ status: "signedIn", configured: true, email: "owner@example.com" }}
      >
        <StubPortalProvider value={{ ready: true }}>
          <OrgSettingsSectionContent
            org={{ ...org, projects: [] }}
            sectionId="members"
          />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    const cta = screen.getByRole("link", { name: /create project/i });
    expect(cta).toHaveAttribute("href", "/portal/acme-co/");
  });

  it("renders billing plan settings", () => {
    render(
      <StubAuthProvider
        value={{ status: "signedIn", configured: true, email: "owner@example.com" }}
      >
        <StubPortalProvider
          value={{
            ready: true,
            billingBusy: false,
            onUpgrade: async () => undefined,
            onManageBilling: async () => undefined,
          }}
        >
          <OrgSettingsSectionContent org={org} sectionId="current-plan" />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /subscription plans/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Solo$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Team$/i })).toBeInTheDocument();
    expect(screen.getByText(/\$10/)).toBeInTheDocument();
    expect(screen.getByText(/\$20/)).toBeInTheDocument();
  });
});
