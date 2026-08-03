import type { Meta, StoryObj } from "@storybook/react";
import { SeatUsageMeter } from "./SeatUsageMeter";

const meta = {
  title: "Features/Portal/Orgs/SeatUsageMeter",
  component: SeatUsageMeter,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SeatUsageMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FreePlan: Story = {
  args: { used: 1, limit: 1 },
};

export const TeamPlan: Story = {
  args: { used: 2, limit: 5 },
};

export const AtLimit: Story = {
  args: { used: 5, limit: 5 },
};
