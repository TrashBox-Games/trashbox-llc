import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { LeadThreadTabs } from "./LeadThreadTabs";

const meta = {
  title: "Features/Portal/Leads/LeadThreadTabs",
  component: LeadThreadTabs,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    tabs: [
      { id: "s1", label: "Ada Lovelace" },
      { id: "s2", label: "Grace Hopper" },
      { id: "s3", label: "Alan Turing" },
    ],
    activeId: "s1",
    onSelect: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof LeadThreadTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleTab: Story = {
  args: {
    tabs: [{ id: "s1", label: "Ada Lovelace" }],
  },
};

export const LongLabels: Story = {
  args: {
    tabs: [
      { id: "s1", label: "Very Long Sender Name That Should Truncate" },
      { id: "s2", label: "Another Extremely Long Display Name Here" },
    ],
    activeId: "s2",
  },
};

export const OverPanel: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-xl bg-background p-8 pt-12">
        <Story />
        <div className="bg-surface-container-low rounded-lg rounded-tl-none p-8 text-sm text-on-surface-variant">
          Thread panel sits under the tabs.
        </div>
      </div>
    ),
  ],
};
