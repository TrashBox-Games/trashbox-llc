import type { Meta, StoryObj } from "@storybook/react";
import { StubPortalProvider } from "@/lib/portal";
import { FormsPage } from "./FormsPage";

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
];

const meta = {
  title: "Features/Portal/Forms/FormsPage",
  component: FormsPage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
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
              tier: "free",
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
        <div className="mx-auto max-w-screen-2xl bg-background px-8 pt-16 pb-24">
          <Story />
        </div>
      </StubPortalProvider>
    ),
  ],
} satisfies Meta<typeof FormsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialState: { forms, canManage: true },
  },
};
