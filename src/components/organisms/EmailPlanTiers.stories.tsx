import type { Meta, StoryObj } from "@storybook/react";
import { EmailPlanTiers } from "./EmailPlanTiers";

const meta = {
  title: "Organisms/EmailPlanTiers",
  component: EmailPlanTiers,
  tags: ["autodocs"],
} satisfies Meta<typeof EmailPlanTiers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCurrentPlan: Story = {
  args: {
    currentPlan: "premium",
  },
};
