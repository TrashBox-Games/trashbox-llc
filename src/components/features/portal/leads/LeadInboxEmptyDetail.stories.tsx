import type { Meta, StoryObj } from "@storybook/react";
import { LeadInboxEmptyDetail } from "./LeadInboxEmptyDetail";

const meta = {
  title: "Features/Portal/Leads/LeadInboxEmptyDetail",
  component: LeadInboxEmptyDetail,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-background max-w-3xl p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LeadInboxEmptyDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyInbox: Story = {};

export const FilteredEmpty: Story = {
  args: { filtered: true },
};

export const SelectALead: Story = {
  args: { variant: "select" },
};
