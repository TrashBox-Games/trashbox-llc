import type { Meta, StoryObj } from "@storybook/react";
import type { EmailContentEntry } from "./EmailContentSettings";
import { EmailContentSettingsSection } from "./EmailContentSettingsSection";

const templates: EmailContentEntry[] = [
  {
    id: "t1",
    name: "Quote follow-up",
    subject: "Your quote from {{business.name}}",
    bodyText:
      "Hi {{lead.first_name}},\n\nThanks for reaching out. Here is the quote you asked about.",
    updatedAt: "2026-07-20T10:00:00.000Z",
  },
];

const signatures: EmailContentEntry[] = [
  {
    id: "g1",
    name: "Sales sign-off",
    bodyText: "Thanks,\n{{sender.name}}\n{{business.name}}",
    isDefault: true,
    updatedAt: "2026-07-20T10:00:00.000Z",
  },
];

const snippets: EmailContentEntry[] = [
  {
    id: "s1",
    name: "Business hours",
    shortcut: "hours",
    bodyText: "We are open 8am to 5pm, Monday through Friday.",
    updatedAt: "2026-07-20T10:00:00.000Z",
  },
];

const meta = {
  title: "Features/Portal/Settings/EmailContentSettingsSection",
  component: EmailContentSettingsSection,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    businessName: "Acme Hauling",
  },
} satisfies Meta<typeof EmailContentSettingsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Templates: Story = {
  args: {
    kind: "template",
    initialState: { items: templates, canManage: true },
  },
};

export const Signatures: Story = {
  args: {
    kind: "signature",
    initialState: { items: signatures, canManage: true },
  },
};

export const Snippets: Story = {
  args: {
    kind: "snippet",
    initialState: { items: snippets, canManage: true },
  },
};

export const MemberWithoutPermission: Story = {
  args: {
    kind: "template",
    initialState: { items: templates, canManage: false },
  },
};
