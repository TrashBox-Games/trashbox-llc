import type { Meta, StoryObj } from "@storybook/react";
import { NotFoundContent } from "./NotFoundContent";

const meta = {
  title: "Features/Marketing/NotFoundContent",
  component: NotFoundContent,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof NotFoundContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
