import type { Meta, StoryObj } from "@storybook/react";
import { SettingsSidebar } from "./SettingsSidebar";

const meta = {
  title: "Features/Portal/Settings/SettingsSidebar",
  component: SettingsSidebar,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/portal/acme/site/settings/email-accounts/",
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

export const ProjectEmailAccountsActive: Story = {
  args: { scope: "project" },
};

export const ProjectGeneralActive: Story = {
  args: { scope: "project" },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/portal/acme/site/settings/general/",
      },
    },
  },
};

export const OrgMembersActive: Story = {
  args: { scope: "org" },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/portal/acme/settings/members/",
      },
    },
  },
};

export const OrgBillingActive: Story = {
  args: { scope: "org" },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/portal/acme/settings/current-plan/",
      },
    },
  },
};
