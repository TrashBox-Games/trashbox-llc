import type { Meta, StoryObj } from "@storybook/react";
import { HomeAbout } from "./HomeAbout";

const meta = {
  title: "Features/Marketing/HomeAbout",
  component: HomeAbout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomeAbout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
