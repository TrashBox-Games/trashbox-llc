import type { Meta, StoryObj } from "@storybook/react";
import { AboutPage } from "./AboutPage";

const meta = {
  title: "Features/Marketing/AboutPage",
  component: AboutPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AboutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
