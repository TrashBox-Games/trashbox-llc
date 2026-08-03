import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { UsageSettings } from "./UsageSettings";

const org = {
  orgId: "o1",
  orgName: "Acme Co",
  orgSlug: "acme-co",
  role: "owner" as const,
  tier: "solo" as const,
  active: true,
  hasBilling: true,
  projects: [
    {
      projectId: "p1",
      projectName: "Marketing",
      projectSlug: "marketing",
    },
  ],
};

const meta = {
  title: "Features/Portal/Orgs/UsageSettings",
  component: UsageSettings,
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
              tier: "solo",
              hasBilling: true,
              role: "owner",
              submissionsUsed: 210,
              submissionLimit: 500,
            },
          }}
        >
          <div className="mx-auto max-w-2xl bg-background p-8">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
} satisfies Meta<typeof UsageSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
