import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import type { MailboxStatusResponse } from "@/lib/api";
import { MailboxSettings } from "./MailboxSettings";

const disconnected: MailboxStatusResponse = {
  connected: false,
};

const connected: MailboxStatusResponse = {
  connected: true,
  provider: "gmail",
  email: "sales@example.com",
  connectedBy: "owner@example.com",
  status: "connected",
  lastSyncAt: "2026-07-15T12:00:00.000Z",
};

const meta = {
  title: "Molecules/MailboxSettings",
  component: MailboxSettings,
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
    mailbox: disconnected,
    onConnect: fn().mockResolvedValue(undefined),
    onDisconnect: fn().mockResolvedValue(undefined),
    onSync: fn().mockResolvedValue(undefined),
  },
} satisfies Meta<typeof MailboxSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OwnerDisconnected: Story = {};

export const MemberDisconnected: Story = {
  args: {
    role: "member",
  },
};

export const AdminConnected: Story = {
  args: {
    role: "admin",
    mailbox: connected,
  },
};

export const ConnectedWithError: Story = {
  args: {
    mailbox: connected,
    error: "Sync failed. Check mailbox permissions.",
  },
};

export const Busy: Story = {
  args: {
    mailbox: connected,
    busy: true,
  },
};

export const WithNotice: Story = {
  args: {
    mailbox: connected,
    notice: "Mailbox connected successfully.",
  },
};
