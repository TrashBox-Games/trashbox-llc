import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { setSelectedWorkspace } from "@/lib/portal-selection";
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

export const Workspace: Story = {
  decorators: [
    (Story) => {
      setSelectedWorkspace("o1", "p1");
      return (
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
              clientName: "Marketing site",
              orgs: [
                {
                  orgId: "o1",
                  orgName: "Acme Co",
              orgSlug: "acme-co",
                  role: "owner",
                  tier: "basic",
                  active: true,
                  hasBilling: false,
                  projects: [
                    { projectId: "p1", projectName: "Marketing site", projectSlug: "marketing-site" },
                  ],
                },
              ],
              account: {
                linked: true,
                email: "owner@example.com",
                orgId: "o1",
                orgName: "Acme Co",
              orgSlug: "acme-co",
                projectId: "p1",
                projectName: "Marketing site",
                clientId: "p1",
                clientName: "Marketing site",
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
      );
    },
  ],
};
