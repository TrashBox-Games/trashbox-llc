import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { OrgSettings } from "./OrgSettings";

const meta = {
  title: "Features/Portal/Orgs/OrgSettings",
  component: OrgSettings,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof OrgSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

const ownerOrg = {
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

export const Owner: Story = {
  args: { org: ownerOrg },
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
};

export const Member: Story = {
  args: { org: { ...ownerOrg, role: "member" } },
  decorators: Owner.decorators,
};
