import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { LeadInboxCard } from "./LeadInboxCard";

const meta = {
  title: "Molecules/LeadInboxCard",
  component: LeadInboxCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    senderName: "Ada Lovelace",
    senderEmail: "ada@example.com",
    message: "Need a quote for a new site",
    submittedAt: "2026-07-15T12:00:00.000Z",
    status: "new",
    active: false,
    replyCount: 0,
    onSelect: fn(),
  },
} satisfies Meta<typeof LeadInboxCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const WithAssignee: Story = {
  args: {
    assignedTo: "owner@example.com",
    status: "contacted",
  },
};

export const OneReply: Story = {
  args: {
    replyCount: 1,
  },
};

export const ManyReplies: Story = {
  args: {
    replyCount: 5,
    status: "qualified",
  },
};

export const Won: Story = {
  args: {
    status: "won",
    assignedTo: "sales@example.com",
  },
};
