import type { Meta, StoryObj } from "@storybook/react";
import { HomeScrollShowcase } from "./HomeScrollShowcase";

const meta = {
  title: "Features/Marketing/HomeScrollShowcase",
  component: HomeScrollShowcase,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomeScrollShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
