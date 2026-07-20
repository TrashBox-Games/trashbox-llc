import type { Meta, StoryObj } from "@storybook/react";
import { AuthProvider } from "@/lib/auth";
import { PortalHeader } from "./PortalHeader";

const meta = {
  title: "Organisms/PortalHeader",
  component: PortalHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/portal/",
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <div className="min-h-[280px] bg-background">
          <Story />
          <div className="px-8 pt-32 font-body text-on-surface-variant">
            Page content sits below the fixed portal header.
          </div>
        </div>
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof PortalHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Reflects local Amplify auth config — signed out when Cognito is not configured. */
export const Default: Story = {};

export const InboxPath: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/portal/inbox/",
      },
    },
  },
};
