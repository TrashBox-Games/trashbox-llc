import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamMembersSettings } from "./TeamMembersSettings";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    getTeam: vi.fn(),
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
      <TeamMembersSettings currentUserEmail="owner@example.com" tier="premium" />,
    );

    expect(await screen.findByText(/owner@example.com/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(getTeam).toHaveBeenCalledTimes(1);
    });
  });
});
