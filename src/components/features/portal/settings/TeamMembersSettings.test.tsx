import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamMembersSettings } from "./TeamMembersSettings";

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

import { getTeam } from "@/lib/api";

describe("TeamMembersSettings", () => {
  beforeEach(() => {
    vi.mocked(getTeam).mockResolvedValue({
      clientId: "c1",
      clientName: "Acme",
      role: "owner",
      permissions: [
        "manage_sender_display_names",
        "allow_all_sender_display_names",
        "manage_team_members",
        "manage_roles_and_permissions",
        "manage_api_keys",
      ],
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
          role: "owner",
          joinedAt: "2026-01-01T00:00:00.000Z",
          emailNotifications: true,
        },
      ],
      invites: [],
      memberLimit: 5,
      memberCount: 1,
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
          memberLimit: 5,
          memberCount: 1,
        }}
      />,
    );

    expect(screen.getByText(/owner@example.com/i)).toBeInTheDocument();
    expect(getTeam).not.toHaveBeenCalled();
  });
});
