import type { Meta, StoryObj } from "@storybook/react";
import { UsageMeter } from "./UsageMeter";

const meta = {
  title: "Features/Portal/Orgs/UsageMeter",
  component: UsageMeter,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Seats",
    used: 2,
    limit: 5,
    ariaLabel: "Team member seats",
  },
} satisfies Meta<typeof UsageMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Seats: Story = {};

export const Submissions: Story = {
  args: {
    label: "Submissions",
    used: 210,
    limit: 500,
    hint: "this month",
    ariaLabel: "Monthly form submissions",
  },
};

export const NearLimit: Story = {
  args: {
    label: "Seats",
    used: 5,
    limit: 5,
    ariaLabel: "Team member seats",
  },
};
