import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import type { ClientRole, TeamInvite, TeamMember } from "@/lib/api";
import { TeamPanel } from "./TeamPanel";

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

const pendingInvite: TeamInvite = {
  email: "new@example.com",
  role: "member",
  roleId: "member",
  invitedBy: "owner@example.com",
  createdAt: "2026-07-10T00:00:00.000Z",
  expiresAt: "2026-07-24T00:00:00.000Z",
  emailNotifications: true,
};

const meta = {
  title: "Features/Portal/Settings/TeamPanel",
  component: TeamPanel,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-4xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    role: "owner",
    currentUserEmail: "owner@example.com",
    members: [owner, member],
    invites: [],
    roles: systemRoles,
    canManageTeamMembers: true,
    senderDisplayNames: [
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
    ],
    memberLimit: 5,
    memberCount: 2,
    tier: "team",
    onInvite: fn().mockResolvedValue(undefined),
    onRevokeInvite: fn().mockResolvedValue(undefined),
    onRemoveMember: fn().mockResolvedValue(undefined),
    onUpdateMember: fn().mockResolvedValue(undefined),
  },
} satisfies Meta<typeof TeamPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InviteDialog: Story = {
  name: "Invite dialog",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /invite member/i }),
    );
    const dialog = within(canvasElement.ownerDocument.body).getByRole(
      "dialog",
      { name: /invite member/i },
    );
    await expect(dialog).toBeInTheDocument();
    await expect(
      within(dialog).queryByLabelText(/first name/i),
    ).not.toBeInTheDocument();
  },
};

export const OwnerAtCapSolo: Story = {
  args: {
    tier: "solo",
    memberLimit: 1,
    memberCount: 1,
    members: [owner],
  },
};

export const OwnerAtCapTeam: Story = {
  args: {
    tier: "team",
    memberLimit: 5,
    memberCount: 5,
    members: [owner, member],
  },
};

export const MemberReadOnly: Story = {
  args: {
    role: "member",
    canManageTeamMembers: false,
    currentUserEmail: "sarah@example.com",
  },
};

export const WithPendingInvites: Story = {
  args: {
    invites: [pendingInvite],
  },
};

export const WithError: Story = {
  args: {
    error: "Could not send invite.",
  },
};

export const Busy: Story = {
  args: {
    busy: true,
  },
};
