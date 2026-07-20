import type { Meta, StoryObj } from "@storybook/react";
import { PlatformNav } from "./PlatformNav";

const meta = {
  title: "Organisms/PlatformNav",
  component: PlatformNav,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/platform/",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-screen-2xl bg-background px-8 py-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OverviewActive: Story = {};

export const FeaturesActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/platform/features/",
      },
    },
  },
};

export const PricingActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/platform/pricing/",
      },
    },
  },
};
