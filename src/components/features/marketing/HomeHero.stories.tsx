import type { Meta, StoryObj } from "@storybook/react";
import { HomeHero } from "./HomeHero";

const meta = {
  title: "Features/Marketing/HomeHero",
  component: HomeHero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomeHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
