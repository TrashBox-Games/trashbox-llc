import type { Meta, StoryObj } from "@storybook/react";
import { MaterialIcon } from "./MaterialIcon";

const meta = {
  title: "Atoms/MaterialIcon",
  component: MaterialIcon,
  tags: ["autodocs"],
} satisfies Meta<typeof MaterialIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "terminal",
  },
};

export const Large: Story = {
  args: {
    name: "layers",
    className: "text-primary",
  },
};
