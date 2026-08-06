import type { Meta, StoryObj } from "@storybook/react";
import { ReadyWhenYouAre } from "./ReadyWhenYouAre";

const meta = {
  title: "Features/Marketing/ReadyWhenYouAre",
  component: ReadyWhenYouAre,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ReadyWhenYouAre>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
