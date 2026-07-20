import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "h-4 w-32",
  },
};

export const Wide: Story = {
  args: {
    className: "h-8 w-48",
  },
};

export const Card: Story = {
  args: {
    className: "h-28 w-full max-w-md",
  },
};

export const Row: Story = {
  render: () => (
    <div className="flex gap-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-12" />
    </div>
  ),
};
