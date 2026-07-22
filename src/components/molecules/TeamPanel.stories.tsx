import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
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
  title: "Molecules/TeamPanel",
  component: TeamPanel,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-background p-8">
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
    tier: "premium",
    onInvite: fn().mockResolvedValue(undefined),
    onRevokeInvite: fn().mockResolvedValue(undefined),
    onRemoveMember: fn().mockResolvedValue(undefined),
    onUpdateMember: fn().mockResolvedValue(undefined),
  },
} satisfies Meta<typeof TeamPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OwnerPremium: Story = {};

export const OwnerAtCapBasic: Story = {
  args: {
    tier: "basic",
    memberLimit: 2,
    memberCount: 2,
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
