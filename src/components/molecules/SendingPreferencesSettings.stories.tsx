import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import type { MailboxStatusResponse } from "@/lib/api";
import { SendingPreferencesSettings } from "./SendingPreferencesSettings";

const mailbox: MailboxStatusResponse = {
  connected: true,
  provider: "gmail",
  email: "sales@example.com",
  status: "connected",
  fromIdentities: [
    {
      id: "alias-1",
      name: "Sales Team",
      createdAt: "2026-07-15T12:00:00.000Z",
    },
  ],
};

const meta = {
  title: "Molecules/SendingPreferencesSettings",
  component: SendingPreferencesSettings,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    canManage: true,
    mailbox,
    onPatch: fn().mockResolvedValue(undefined),
  },
} satisfies Meta<typeof SendingPreferencesSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ManagerCatalog: Story = {};

export const ReadOnlyCatalog: Story = {
  args: {
    canManage: false,
  },
};

export const EmptyCatalog: Story = {
  args: {
    mailbox: {
      ...mailbox,
      fromIdentities: [],
    },
  },
};
