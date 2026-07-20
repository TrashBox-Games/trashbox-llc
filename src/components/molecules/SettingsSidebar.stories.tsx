import type { Meta, StoryObj } from "@storybook/react";
import { SettingsSidebar } from "./SettingsSidebar";

const meta = {
  title: "Molecules/SettingsSidebar",
  component: SettingsSidebar,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/portal/settings/email-accounts/",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs bg-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmailAccountsActive: Story = {};

export const MembersActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/portal/settings/members/",
      },
    },
  },
};

export const GeneralActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/portal/settings/general/",
      },
    },
  },
};
