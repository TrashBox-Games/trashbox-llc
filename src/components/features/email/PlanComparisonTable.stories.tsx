import type { Meta, StoryObj } from "@storybook/react";
import { PlanComparisonTable } from "./PlanComparisonTable";

const meta = {
  title: "Features/Email/PlanComparisonTable",
  component: PlanComparisonTable,
  tags: ["autodocs"],
} satisfies Meta<typeof PlanComparisonTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
