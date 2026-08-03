import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { setSelectedWorkspace } from "@/lib/portal-selection";
import { WorkspaceBreadcrumb } from "./WorkspaceBreadcrumb";

const meta = {
  title: "Features/Portal/WorkspaceBreadcrumb",
  component: WorkspaceBreadcrumb,
  tags: ["autodocs"],
} satisfies Meta<typeof WorkspaceBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const portalStub = {
  ready: true,
  orgs: [
    {
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
        { projectId: "p2", projectName: "App", projectSlug: "app" },
      ],
    },
    {
      orgId: "o2",
      orgName: "Beta LLC",
      orgSlug: "beta-llc",
      role: "member" as const,
      tier: "team" as const,
      active: true,
      hasBilling: true,
      projects: [{ projectId: "p3", projectName: "Docs", projectSlug: "docs" }],
    },
  ],
  account: {
    linked: true,
    orgId: "o1",
    orgName: "Acme Co",
    orgSlug: "acme-co",
    projectId: "p1",
    projectName: "Marketing site",
  },
  selectWorkspace: () => {},
};

export const Default: Story = {
  decorators: [
    (Story) => {
      setSelectedWorkspace("o1", "p1");
      window.history.replaceState(
        {},
        "",
        "/portal/acme-co/marketing-site/",
      );
      return (
        <StubAuthProvider value={{ status: "signedIn", configured: true }}>
          <StubPortalProvider value={portalStub}>
            <div className="bg-background p-8">
              <Story />
            </div>
          </StubPortalProvider>
        </StubAuthProvider>
      );
    },
  ],
};

export const OrgDashboard: Story = {
  decorators: [
    (Story) => {
      setSelectedWorkspace("o1", null);
      window.history.replaceState({}, "", "/portal/acme-co/");
      return (
        <StubAuthProvider value={{ status: "signedIn", configured: true }}>
          <StubPortalProvider value={portalStub}>
            <div className="bg-background p-8">
              <Story />
            </div>
          </StubPortalProvider>
        </StubAuthProvider>
      );
    },
  ],
};
