import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
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
      <StubAuthProvider
        value={{
          configured: true,
          status: "signedIn",
          email: "owner@example.com",
        }}
      >
        <StubPortalProvider
          value={{
            clientName: "Acme Co",
            ready: true,
            members: [
              {
                email: "owner@example.com",
                role: "owner",
                joinedAt: "2024-01-01",
                firstName: "Ada",
                lastName: "Lovelace",
                emailNotifications: true,
              },
            ],
          }}
        >
          <div className="min-h-[140vh] bg-background">
            <Story />
            <div className="space-y-6 px-8 pt-16 font-body text-on-surface-variant">
              <p>Scroll down to hide the header; scroll up to reveal it again.</p>
              {Array.from({ length: 12 }, (_, i) => (
                <p key={i}>Placeholder content block {i + 1} for scroll demos.</p>
              ))}
            </div>
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
} satisfies Meta<typeof PortalHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const SignedOut: Story = {
  decorators: [
    (Story) => (
      <StubAuthProvider value={{ configured: true, status: "signedOut" }}>
        <StubPortalProvider>
          <div className="min-h-[280px] bg-background">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
};
