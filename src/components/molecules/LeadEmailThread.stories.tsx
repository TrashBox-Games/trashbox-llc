import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import type { LeadMessage } from "@/lib/api";
import { LeadEmailThread } from "./LeadEmailThread";

const outboundReply: LeadMessage = {
  clientId: "c1",
  submissionId: "s1",
  messageId: "m1",
  direction: "outbound",
  from: "sales@example.com",
  to: "ada@example.com",
  subject: "Re: Need a quote",
  bodyText: "Thanks for reaching out — happy to help.",
  createdAt: "2026-07-15T13:00:00.000Z",
  sentBy: "owner@example.com",
};

const meta = {
  title: "Molecules/LeadEmailThread",
  component: LeadEmailThread,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    formMessage: "Need a quote for a new site",
    formFrom: "ada@example.com",
    formAt: "2026-07-15T12:00:00.000Z",
    messages: [],
    mailboxConnected: false,
    onSend: fn().mockResolvedValue(undefined),
  },
} satisfies Meta<typeof LeadEmailThread>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disconnected: Story = {};

export const ConnectedEmpty: Story = {
  args: {
    mailboxConnected: true,
    fromAddress: "sales@example.com",
  },
};

export const WithOutboundReply: Story = {
  args: {
    mailboxConnected: true,
    fromAddress: "sales@example.com",
    messages: [outboundReply],
  },
};

export const WithError: Story = {
  args: {
    mailboxConnected: true,
    error: "Failed to send message. Try again.",
  },
};

export const Busy: Story = {
  args: {
    mailboxConnected: true,
    busy: true,
  },
};
