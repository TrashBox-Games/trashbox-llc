import type { Meta, StoryObj } from "@storybook/react";
import { AuthProvider } from "@/lib/auth";
import { PortalHeader } from "./PortalHeader";

const meta = {
  title: "Features/Portal/PortalHeader",
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
        <div className="min-h-[140vh] bg-background">
          <Story />
          <div className="space-y-6 px-8 pt-32 font-body text-on-surface-variant">
            <p>Scroll down to hide the header; scroll up to reveal it again.</p>
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i}>Placeholder content block {i + 1} for scroll demos.</p>
            ))}
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
