import type { Meta, StoryObj } from "@storybook/react";
import { PlatformOverview } from "./PlatformOverview";

const meta = {
  title: "Features/Marketing/PlatformOverview",
  component: PlatformOverview,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PlatformOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
