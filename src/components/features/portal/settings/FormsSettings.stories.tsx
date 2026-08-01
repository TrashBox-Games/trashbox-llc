import type { Meta, StoryObj } from "@storybook/react";
import { StubPortalProvider } from "@/lib/portal";
import { FormsSettings } from "./FormsSettings";

const forms = [
  {
    formId: "f1",
    clientId: "c1",
    name: "Default",
    slug: "default",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    submissionCount: 12,
  },
  {
    formId: "f2",
    clientId: "c1",
    name: "Contact",
    slug: "contact",
    active: true,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    submissionCount: 48,
  },
  {
    formId: "f3",
    clientId: "c1",
    name: "Quote",
    slug: "quote",
    active: false,
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
    submissionCount: 2,
  },
];

const meta = {
  title: "Features/Portal/Settings/FormsSettings",
  component: FormsSettings,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <StubPortalProvider
        value={{
          ready: true,
          account: {
            linked: true,
            projectId: "c1",
            projectName: "Marketing site",
            projectSlug: "marketing-site",
          },
          orgs: [
            {
              orgId: "o1",
              orgName: "Acme",
              orgSlug: "acme",
              role: "owner",
              tier: "basic",
              active: true,
              hasBilling: false,
              projects: [
                {
                  projectId: "c1",
                  projectName: "Marketing site",
                  projectSlug: "marketing-site",
                },
              ],
            },
          ],
        }}
      >
        <div className="mx-auto max-w-screen-2xl bg-background p-8">
          <Story />
        </div>
      </StubPortalProvider>
    ),
  ],
} satisfies Meta<typeof FormsSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Manager: Story = {
  args: {
    initialState: { forms, canManage: true },
  },
};

export const ReadOnly: Story = {
  args: {
    initialState: { forms, canManage: false },
  },
};
