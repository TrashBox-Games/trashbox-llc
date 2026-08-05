import type { Meta, StoryObj } from "@storybook/react";
import { HomeCta } from "./HomeCta";

const meta = {
  title: "Features/Marketing/HomeCta",
  component: HomeCta,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomeCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
