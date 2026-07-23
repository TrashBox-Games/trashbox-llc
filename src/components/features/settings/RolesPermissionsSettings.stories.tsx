import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import type { ClientRole } from "@/lib/api";
import { RolesPermissionsSettings } from "./RolesPermissionsSettings";

const adminRole: ClientRole = {
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
};

const memberRole: ClientRole = {
  id: "member",
  name: "Member",
  system: true,
  permissions: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const customRole: ClientRole = {
  id: "support",
  name: "Support",
  system: false,
  permissions: ["manage_team_members"],
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

const meta = {
  title: "Features/Settings/RolesPermissionsSettings",
  component: RolesPermissionsSettings,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    isOwner: true,
    canManage: true,
    roles: [adminRole, memberRole, customRole],
    onCreateRole: fn().mockResolvedValue(undefined),
    onUpdateRole: fn().mockResolvedValue(undefined),
    onDeleteRole: fn().mockResolvedValue(undefined),
  },
} satisfies Meta<typeof RolesPermissionsSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OwnerEditor: Story = {};

export const ReadOnlyMember: Story = {
  args: {
    isOwner: false,
    canManage: false,
  },
};

export const SystemRolesOnly: Story = {
  args: {
    roles: [adminRole, memberRole],
  },
};

export const WithError: Story = {
  args: {
    error: "Could not update role.",
  },
};

export const Busy: Story = {
  args: {
    busy: true,
  },
};
