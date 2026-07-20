import type { Meta, StoryObj } from "@storybook/react";
import { SettingsShell } from "./SettingsShell";

const meta = {
  title: "Organisms/SettingsShell",
  component: SettingsShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/portal/settings/email-accounts/",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background">
        <Story />
      </div>
    ),
  ],
  args: {
    children: (
      <div className="border border-outline-variant/10 bg-surface-container-low p-6 text-sm text-on-surface-variant">
        Section content slot
      </div>
    ),
  },
} satisfies Meta<typeof SettingsShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmailAccounts: Story = {};

export const Members: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/portal/settings/members/",
      },
    },
  },
};
