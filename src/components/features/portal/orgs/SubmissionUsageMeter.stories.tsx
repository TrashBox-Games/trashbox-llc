import type { Meta, StoryObj } from "@storybook/react";
import { SubmissionUsageMeter } from "./SubmissionUsageMeter";

const meta = {
  title: "Features/Portal/Orgs/SubmissionUsageMeter",
  component: SubmissionUsageMeter,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SubmissionUsageMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FreePlan: Story = {
  args: { used: 3, limit: 10 },
};

export const NearLimit: Story = {
  args: { used: 480, limit: 500 },
};

export const AtLimit: Story = {
  args: { used: 5000, limit: 5000 },
};
