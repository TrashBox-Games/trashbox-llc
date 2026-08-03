import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { BillingPlanSettings } from "./BillingPlanSettings";

const org = {
  orgId: "o1",
  orgName: "Acme Co",
  orgSlug: "acme-co",
  role: "owner" as const,
  tier: "free" as const,
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
              tier: "free",
              hasBilling: false,
              role: "owner",
              submissionsUsed: 3,
              submissionLimit: 10,
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

export const FreePlan: Story = {};

export const NoProjects: Story = {
  args: {
    org: { ...org, projects: [] },
  },
};

export const TeamPlan: Story = {
  args: {
    org: { ...org, tier: "team", hasBilling: true },
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
              tier: "team",
              hasBilling: true,
              role: "owner",
              submissionsUsed: 120,
              submissionLimit: 5000,
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
