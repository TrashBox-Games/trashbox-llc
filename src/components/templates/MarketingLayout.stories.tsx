import type { Meta, StoryObj } from "@storybook/react";
import { MarketingLayout } from "./MarketingLayout";

const meta = {
  title: "Templates/MarketingLayout",
  component: MarketingLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    children: (
      <div className="mx-auto max-w-3xl px-8 py-32">
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-white">
          Page slot
        </h1>
        <p className="mt-4 text-on-surface-variant">
          Header and footer wrap whatever route content you pass as children.
        </p>
      </div>
    ),
  },
} satisfies Meta<typeof MarketingLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
