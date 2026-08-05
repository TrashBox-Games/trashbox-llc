import type { Meta, StoryObj } from "@storybook/react";
import { PlatformNav } from "./PlatformNav";

const meta = {
  title: "Features/Marketing/PlatformNav",
  component: PlatformNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/platform/",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-48 bg-background">
        <Story />
        <div className="px-8 pt-32 font-body text-on-surface-variant">
          Platform page content sits below the fixed CRM header.
        </div>
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
