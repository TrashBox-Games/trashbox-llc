import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { BillingPlanSettings } from "./BillingPlanSettings";

const org = {
  orgId: "o1",
  orgName: "Acme Co",
  orgSlug: "acme-co",
  role: "owner" as const,
  tier: "basic" as const,
  active: true,
  hasBilling: false,
  projects: [
    {
      projectId: "p1",
      projectName: "Marketing site",
      projectSlug: "marketing-site",
    },
  ],
};

const meta = {
  title: "Features/Portal/Orgs/BillingPlanSettings",
  component: BillingPlanSettings,
  tags: ["autodocs"],
  args: { org },
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
            account: {
              linked: true,
              email: "owner@example.com",
              tier: "basic",
              hasBilling: false,
              role: "owner",
              emailsUsed: 12,
              emailLimit: 1000,
            },
            billingBusy: false,
            onUpgrade: async () => undefined,
            onManageBilling: async () => undefined,
          }}
        >
          <div className="mx-auto max-w-2xl bg-background p-8">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
} satisfies Meta<typeof BillingPlanSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoPlan: Story = {};

export const Premium: Story = {
  args: {
    org: { ...org, tier: "premium", hasBilling: true },
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
        <StubPortalProvider
          value={{
            ready: true,
            account: {
              linked: true,
              email: "owner@example.com",
              tier: "premium",
              hasBilling: true,
              role: "owner",
              emailsUsed: 120,
              emailLimit: 10000,
            },
            billingBusy: false,
            onUpgrade: async () => undefined,
            onManageBilling: async () => undefined,
          }}
        >
          <div className="mx-auto max-w-2xl bg-background p-8">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
};
