import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { OrgPicker } from "./OrgPicker";

const meta = {
  title: "Features/Portal/Orgs/OrgPicker",
  component: OrgPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof OrgPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithOrganizations: Story = {
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
            orgs: [
              {
                orgId: "o1",
                orgName: "Acme Co",
                role: "owner",
                tier: "basic",
                active: true,
                hasBilling: false,
                projects: [{ projectId: "p1", projectName: "Site A" }],
              },
              {
                orgId: "o2",
                orgName: "Beta LLC",
                role: "member",
                tier: "premium",
                active: true,
                hasBilling: true,
                projects: [{ projectId: "p2", projectName: "App" }],
              },
            ],
            account: { linked: true, email: "owner@example.com" },
            selectWorkspace: () => {},
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

export const Empty: Story = {
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
            orgs: [],
            account: { linked: false, email: "owner@example.com" },
            businessName: "",
            projectNameDraft: "",
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
