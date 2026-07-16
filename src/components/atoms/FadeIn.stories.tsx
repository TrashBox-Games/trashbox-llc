import type { Meta, StoryObj } from "@storybook/react";
import { FadeIn } from "./FadeIn";

const meta = {
  title: "Atoms/FadeIn",
  component: FadeIn,
  tags: ["autodocs"],
  args: {
    children: (
      <p className="font-headline text-2xl font-bold text-white">Fades in on mount</p>
    ),
  },
} satisfies Meta<typeof FadeIn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Delayed: Story = {
  args: {
    delay: 0.4,
    children: (
      <p className="font-headline text-2xl font-bold text-white">Starts after 400ms</p>
    ),
  },
};

export const LargerOffset: Story = {
  args: {
    y: 40,
    children: (
      <p className="font-headline text-2xl font-bold text-white">Travels farther on the Y axis</p>
    ),
  },
};
