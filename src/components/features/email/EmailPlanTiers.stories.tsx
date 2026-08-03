import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { EmailPlanTiers } from "./EmailPlanTiers";

const meta = {
  title: "Features/Email/EmailPlanTiers",
  component: EmailPlanTiers,
  tags: ["autodocs"],
} satisfies Meta<typeof EmailPlanTiers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCurrentPlan: Story = {
  args: {
    currentPlan: "team",
    onSelectPlan: fn(),
  },
};
