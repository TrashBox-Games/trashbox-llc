import type { Meta, StoryObj } from "@storybook/react";
import { AppsPage } from "./AppsPage";

const meta = {
  title: "Features/Marketing/AppsPage",
  component: AppsPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AppsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
