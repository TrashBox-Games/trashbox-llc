import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import type { LeadMessage, Submission, TeamMember } from "@/lib/api";
import { LeadDetail } from "./LeadDetail";

const members: TeamMember[] = [
  {
    email: "owner@example.com",
    role: "owner",
    joinedAt: "2026-01-01",
    emailNotifications: true,
  },
  {
    email: "sarah@example.com",
    role: "member",
    joinedAt: "2026-01-01",
    emailNotifications: false,
  },
];

const baseSubmission: Submission = {
  clientId: "c1",
  submissionId: "s1",
  senderName: "Ada Lovelace",
  senderEmail: "ada@example.com",
  message: "Need a quote for a new site",
  submittedAt: "2026-07-15T12:00:00.000Z",
  status: "new",
  tags: [],
  notes: [],
  assignedTo: null,
};

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
  title: "Molecules/LeadDetail",
  component: LeadDetail,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    submission: baseSubmission,
    members,
    onUpdate: fn().mockResolvedValue(undefined),
    onAddNote: fn().mockResolvedValue(undefined),
  },
} satisfies Meta<typeof LeadDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithNotesAndTags: Story = {
  args: {
    submission: {
      ...baseSubmission,
      status: "contacted",
      tags: ["website_quote", "sales"],
      assignedTo: "sarah@example.com",
      notes: [
        {
          id: "n1",
          body: "Followed up by email.",
          authorEmail: "owner@example.com",
          createdAt: "2026-07-15T14:00:00.000Z",
        },
      ],
    },
  },
};

export const WithEmailThread: Story = {
  args: {
    mailboxConnected: true,
    messages: [outboundReply],
    onSendMessage: fn().mockResolvedValue(undefined),
  },
};

export const Busy: Story = {
  args: {
    busy: true,
  },
};

export const WithMetadata: Story = {
  args: {
    submission: {
      ...baseSubmission,
      metadata: {
        company: "Analytical Engines",
        source: "homepage",
      },
    },
  },
};
