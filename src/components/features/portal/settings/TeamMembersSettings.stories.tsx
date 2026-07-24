import type { Meta, StoryObj } from "@storybook/react";
import type { ClientRole, TeamInvite, TeamMember } from "@/lib/api";
import { TeamMembersSettings } from "./TeamMembersSettings";

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

const demoTeamState = {
  role: "owner" as const,
  canManageTeamMembers: true,
  members: [owner, member],
  invites: [] as TeamInvite[],
  roles: systemRoles,
  memberLimit: 5,
  memberCount: 2,
  senderDisplayNames: [
    {
      id: "s1",
      name: "Acme Support",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

const meta = {
  title: "Features/Portal/Settings/TeamMembersSettings",
  component: TeamMembersSettings,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl bg-background px-8 py-16">
        <Story />
      </div>
    ),
  ],
  args: {
    currentUserEmail: "owner@example.com",
    tier: "premium",
    initialState: demoTeamState,
  },
} satisfies Meta<typeof TeamMembersSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BasicTier: Story = {
  name: "Basic tier",
  args: {
    tier: "basic",
    initialState: {
      ...demoTeamState,
      memberLimit: 1,
      memberCount: 1,
      members: [owner],
    },
  },
};

export const WithPendingInvite: Story = {
  name: "With pending invite",
  args: {
    initialState: {
      ...demoTeamState,
      invites: [pendingInvite],
      memberCount: 2,
    },
  },
};
