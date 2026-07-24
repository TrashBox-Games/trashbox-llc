import type { Meta, StoryObj } from "@storybook/react";
import { LeadStatusBadge } from "./LeadStatusBadge";

const meta = {
  title: "Features/Portal/Leads/LeadStatusBadge",
  component: LeadStatusBadge,
  tags: ["autodocs"],
} satisfies Meta<typeof LeadStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {
  args: {
    status: "new",
  },
};

export const Contacted: Story = {
  args: {
    status: "contacted",
  },
};

export const Qualified: Story = {
  args: {
    status: "qualified",
  },
};

export const Won: Story = {
  args: {
    status: "won",
  },
};

export const Lost: Story = {
  args: {
    status: "lost",
  },
};
