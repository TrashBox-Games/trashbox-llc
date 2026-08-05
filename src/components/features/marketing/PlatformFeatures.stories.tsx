import type { Meta, StoryObj } from "@storybook/react";
import { PlatformFeatures } from "./PlatformFeatures";

const meta = {
  title: "Features/Marketing/PlatformFeatures",
  component: PlatformFeatures,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PlatformFeatures>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
