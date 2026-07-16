import type { Meta, StoryObj } from "@storybook/react";
import { Reveal } from "./Reveal";

const meta = {
  title: "Atoms/Reveal",
  component: Reveal,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="space-y-8 py-8">
        <p className="font-label text-xs tracking-widest text-outline uppercase">
          Scroll if needed — reveal runs once when in view
        </p>
        <Story />
      </div>
    ),
  ],
  args: {
    children: (
      <div className="border border-outline-variant/30 bg-surface-container-low p-8">
        <p className="font-headline text-xl font-bold text-white">Revealed content</p>
      </div>
    ),
  },
} satisfies Meta<typeof Reveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFade: Story = {
  args: {
    fade: true,
    children: (
      <div className="border border-outline-variant/30 bg-surface-container-low p-8">
        <p className="font-headline text-xl font-bold text-white">Fade + slide reveal</p>
      </div>
    ),
  },
};

export const Delayed: Story = {
  args: {
    delay: 0.35,
    fade: true,
  },
};
