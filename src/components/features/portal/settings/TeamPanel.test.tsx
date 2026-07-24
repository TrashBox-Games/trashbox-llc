import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ClientRole, TeamMember } from "@/lib/api";
import { TeamPanel } from "./TeamPanel";

/** Drive Radix Select via its hidden native <select> (jsdom cannot open the portal). */
function selectOption(combobox: HTMLElement, value: string) {
  const native = combobox.parentElement?.querySelector("select");
  if (!native) {
    throw new Error("Expected Radix Select to render a native <select>");
  }
  fireEvent.change(native, { target: { value } });
}

const systemRoles: ClientRole[] = [
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
];

const owner: TeamMember = {
  email: "owner@example.com",
  role: "owner",
  joinedAt: "2026-01-01T00:00:00.000Z",
  emailNotifications: true,
};

const member: TeamMember = {
  email: "sarah@example.com",
  role: "member",
  roleId: "member",
  joinedAt: "2026-02-01T00:00:00.000Z",
  firstName: "Sarah",
  lastName: "Chen",
  emailNotifications: false,
  allowedFromIdentityIds: ["s1"],
  defaultFromIdentityId: "s1",
};

const adminMember: TeamMember = {
  email: "admin@example.com",
  role: "admin",
  roleId: "admin",
  joinedAt: "2026-02-01T00:00:00.000Z",
  firstName: "Alex",
  lastName: "Admin",
  emailNotifications: true,
};

const catalog = [
  {
    id: "s1",
    name: "Sales Team",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "s2",
    name: "Support",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

const defaultProps = {
  role: "owner" as const,
  currentUserEmail: "owner@example.com",
  members: [owner],
  invites: [],
  roles: systemRoles,
  canManageTeamMembers: true,
  senderDisplayNames: catalog,
  memberLimit: 5,
  memberCount: 1,
  onInvite: vi.fn(),
  onRevokeInvite: vi.fn(),
  onRemoveMember: vi.fn(),
  onUpdateMember: vi.fn(),
};

describe("TeamPanel", () => {
  it("invites with first and last name and roleId", async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn().mockResolvedValue(undefined);

    render(
      <TeamPanel
        {...defaultProps}
        onInvite={onInvite}
      />,
    );

    await user.type(screen.getByLabelText(/^email$/i), "new@example.com");
    await user.type(screen.getByLabelText(/first name/i), "New");
    await user.type(screen.getByLabelText(/last name/i), "Hire");
    selectOption(screen.getByRole("combobox", { name: /^role$/i }), "admin");
    await user.click(screen.getByRole("button", { name: /send invite/i }));

    expect(onInvite).toHaveBeenCalledWith({
      email: "new@example.com",
      firstName: "New",
      lastName: "Hire",
      emailNotifications: true,
      roleId: "admin",
    });
  });

  it("lets owners assign allowed and default Sender Display Names", async () => {
    const user = userEvent.setup();
    const onUpdateMember = vi.fn().mockResolvedValue(undefined);

    render(
      <TeamPanel
        {...defaultProps}
        members={[owner, member]}
        memberCount={2}
        onUpdateMember={onUpdateMember}
      />,
    );

    const editButtons = screen.getAllByRole("button", { name: /edit profile/i });
    await user.click(editButtons[1]!);
    await user.click(screen.getByRole("checkbox", { name: /Support/i }));
    selectOption(
      screen.getByRole("combobox", { name: /Default Sender Display Name/i }),
      "s2",
    );
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(onUpdateMember).toHaveBeenCalledWith(
      "sarah@example.com",
      expect.objectContaining({
        allowedFromIdentityIds: ["s1", "s2"],
        defaultFromIdentityId: "s2",
      }),
    );
  });

  it("shows a note instead of allow-list when role allows all sender names", async () => {
    const user = userEvent.setup();

    render(
      <TeamPanel
        {...defaultProps}
        members={[owner, adminMember]}
        memberCount={2}
      />,
    );

    const editButtons = screen.getAllByRole("button", { name: /edit profile/i });
    await user.click(editButtons[1]!);

    expect(
      screen.getByText(/allows all Sender Display Names/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Allowed Sender Display Names/i),
    ).not.toBeInTheDocument();
  });

  it("shows Owner badge and hides invite when lacking manage_team_members", () => {
    render(
      <TeamPanel
        {...defaultProps}
        role="member"
        canManageTeamMembers={false}
        members={[owner, member]}
        memberCount={2}
        currentUserEmail="sarah@example.com"
      />,
    );

    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /send invite/i }),
    ).not.toBeInTheDocument();
  });

  it("shows first and last name in the member list", () => {
    render(
      <TeamPanel
        {...defaultProps}
        members={[owner, member]}
        memberCount={2}
      />,
    );

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
  });
});
