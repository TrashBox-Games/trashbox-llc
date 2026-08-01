import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { PortalHome } from "./PortalHome";

const meta = {
  title: "Features/Portal/Home/PortalHome",
  component: PortalHome,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PortalHome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unlinked: Story = {
  decorators: [
    (Story) => (
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "owner@example.com",
        }}
      >
        <StubPortalProvider
          value={{
            ready: true,
            account: { linked: false, email: "owner@example.com" },
            businessName: "",
          }}
        >
          <div className="mx-auto max-w-screen-2xl px-8 pt-16 pb-24">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
};

export const Linked: Story = {
  decorators: [
    (Story) => (
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "owner@example.com",
        }}
      >
        <StubPortalProvider
          value={{
            ready: true,
            clientName: "Acme Co",
            account: {
              linked: true,
              email: "owner@example.com",
              clientName: "Acme Co",
              clientId: "c1",
              tier: "basic",
              active: true,
              hasApiKey: true,
              hasBilling: false,
              role: "owner",
            },
          }}
        >
          <div className="mx-auto max-w-screen-2xl px-8 pt-16 pb-24">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
};
