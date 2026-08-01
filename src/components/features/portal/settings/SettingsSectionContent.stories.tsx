import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { SettingsSectionContent } from "./SettingsSectionContent";

const signedInDecorator: Decorator = (Story) => (
  <StubAuthProvider
    value={{
      configured: true,
      status: "signedIn",
      email: "owner@example.com",
    }}
  >
    <StubPortalProvider
      value={{
        ready: true,
        account: {
          linked: true,
          email: "owner@example.com",
          clientName: "Acme",
          tier: "premium",
          active: true,
          hasBilling: true,
          hasApiKey: true,
          role: "owner",
          emailsUsed: 25,
          emailLimit: 1000,
        },
        clientName: "Acme",        isOwner: true,
        hasPermission: () => true,
        mailbox: {
          connected: true,
          email: "inbox@acme.example",
          provider: "gmail",
          fromIdentities: [
            {
              id: "s1",
              name: "Acme Support",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        },
      }}
    >
      <div className="mx-auto max-w-2xl bg-background px-8 py-16">
        <Story />
      </div>
    </StubPortalProvider>
  </StubAuthProvider>
);

const meta = {
  title: "Features/Portal/Settings/SettingsSectionContent",
  component: SettingsSectionContent,
  tags: ["autodocs"],
  decorators: [signedInDecorator],
  args: {
    sectionId: "email-accounts",
  },
} satisfies Meta<typeof SettingsSectionContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const General: Story = {
  args: {
    sectionId: "general",
  },
};

export const EmailAccounts: Story = {
  args: {
    sectionId: "email-accounts",
  },
};

export const ApiKeys: Story = {
  args: {
    sectionId: "api-keys",
    apiKeysInitialState: {
      canManage: true,
      account: {
        linked: true,
        email: "owner@example.com",
        clientName: "Acme",
        tier: "premium",
        active: true,
        hasBilling: true,
        hasApiKey: false,
        role: "owner",
      },
    },
  },
};

export const BrandingPlaceholder: Story = {
  args: {
    sectionId: "branding",
  },
};

export const Loading: Story = {
  decorators: [
    (Story) => (
      <StubAuthProvider value={{ configured: true, status: "loading" }}>
        <StubPortalProvider>
          <div className="mx-auto max-w-2xl bg-background px-8 py-16">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
};

export const AccountUnlinked: Story = {
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
            ready: true,
            account: {
              linked: false,
              email: "owner@example.com",
            },
          }}
        >
          <div className="mx-auto max-w-2xl bg-background px-8 py-16">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
};
