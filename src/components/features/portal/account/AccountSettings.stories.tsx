import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { AccountSettings } from "./AccountSettings";

const meta = {
  title: "Features/Portal/Account/AccountSettings",
  component: AccountSettings,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "owner@example.com",
        }}
      >
        <StubPortalProvider value={{ ready: true }}>
          <div className="mx-auto max-w-screen-2xl px-8 pt-16 pb-24">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
} satisfies Meta<typeof AccountSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialState: {
      profile: {
        email: "owner@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
      },
      organizations: [
        {
          orgId: "o1",
          orgName: "Acme Co",
          orgSlug: "acme-co",
          role: "owner",
          isOwner: true,
        },
        {
          orgId: "o2",
          orgName: "Beta LLC",
          orgSlug: "beta-llc",
          role: "member",
          isOwner: false,
        },
      ],
    },
  },
};

export const NoOrganizations: Story = {
  args: {
    initialState: {
      profile: {
        email: "owner@example.com",
      },
      organizations: [],
    },
  },
};
