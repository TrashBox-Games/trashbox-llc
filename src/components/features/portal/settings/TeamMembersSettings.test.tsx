import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/components/ui/sonner";
import { TeamMembersSettings } from "./TeamMembersSettings";

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    getTeam: vi.fn(),
    getMailbox: vi.fn().mockResolvedValue({
      connected: false,
      fromIdentities: [],
    }),
    createTeamInvite: vi.fn(),
    deleteTeamInvite: vi.fn(),
    deleteTeamMember: vi.fn(),
    updateTeamMember: vi.fn(),
  };
});

import { createTeamInvite, getTeam } from "@/lib/api";

const teamOwnerResponse = {
  clientId: "c1",
  clientName: "Acme",
  role: "owner" as const,
  permissions: [
    "manage_sender_display_names",
    "allow_all_sender_display_names",
    "manage_team_members",
    "manage_roles_and_permissions",
    "manage_api_keys",
  ] as const,
  roles: [
    {
      id: "admin",
      name: "Admin",
      system: true,
      permissions: [
        "manage_sender_display_names",
        "allow_all_sender_display_names",
        "manage_team_members",
        "manage_roles_and_permissions",
        "manage_api_keys",
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "member",
      name: "Member",
      system: true,
      permissions: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  members: [
    {
      email: "owner@example.com",
      role: "owner" as const,
      joinedAt: "2026-01-01T00:00:00.000Z",
      emailNotifications: true,
    },
  ],
  invites: [],
  tier: "team" as const,
  memberLimit: 5,
  memberCount: 1,
};

describe("TeamMembersSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTeam).mockResolvedValue({ ...teamOwnerResponse });
    vi.mocked(createTeamInvite).mockResolvedValue({
      invite: {
        email: "new@example.com",
        role: "member",
        roleId: "member",
        invitedBy: "owner@example.com",
        createdAt: "2026-07-10T00:00:00.000Z",
        expiresAt: "2026-07-24T00:00:00.000Z",
        emailNotifications: true,
      },
    });
  });

  it("fetches team on mount and shows members", async () => {
    render(
      <TeamMembersSettings currentUserEmail="owner@example.com" tier="team" />,
    );

    expect(await screen.findByText(/owner@example.com/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(getTeam).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText(/Seats 1 \/ 5/i)).toBeInTheDocument();
  });

  it("uses catalog Team seats when API returns a stale 1-seat limit", async () => {
    vi.mocked(getTeam).mockResolvedValue({
      ...teamOwnerResponse,
      tier: "team",
      memberLimit: 1,
    });

    render(
      <TeamMembersSettings currentUserEmail="owner@example.com" tier="team" />,
    );

    expect(await screen.findByText(/Seats 1 \/ 5/i)).toBeInTheDocument();
  });

  it("renders from initialState without calling the API", () => {
    vi.mocked(getTeam).mockClear();

    render(
      <TeamMembersSettings
        currentUserEmail="owner@example.com"
        tier="team"
        initialState={{
          role: "owner",
          canManageTeamMembers: true,
          members: [
            {
              email: "owner@example.com",
              role: "owner",
              joinedAt: "2026-01-01T00:00:00.000Z",
              emailNotifications: true,
            },
          ],
          invites: [],
          roles: [],
          tier: "team",
          memberLimit: 5,
          memberCount: 1,
        }}
      />,
    );

    expect(screen.getByText(/owner@example.com/i)).toBeInTheDocument();
    expect(getTeam).not.toHaveBeenCalled();
  });

  it("toasts when an invite is sent", async () => {
    const user = userEvent.setup();

    render(
      <TeamMembersSettings currentUserEmail="owner@example.com" tier="team" />,
    );

    expect(await screen.findByText(/owner@example.com/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /invite member/i }));
    await user.type(screen.getByLabelText(/^email$/i), "new@example.com");
    await user.click(screen.getByRole("button", { name: /send invite/i }));

    await waitFor(() => {
      expect(createTeamInvite).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Invite sent to new@example.com.",
    );
    expect(
      screen.queryByText(/Invite sent to new@example.com/i),
    ).not.toBeInTheDocument();
  });

  it("toasts a stored portal team notice on load", async () => {
    sessionStorage.setItem("portalTeamNotice", "Joined Acme.");

    render(
      <TeamMembersSettings currentUserEmail="owner@example.com" tier="team" />,
    );

    expect(await screen.findByText(/owner@example.com/i)).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("Joined Acme.");
    expect(sessionStorage.getItem("portalTeamNotice")).toBeNull();
  });
});
