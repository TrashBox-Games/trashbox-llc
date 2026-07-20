import type { Meta, StoryObj } from "@storybook/react";
import { AuthProvider } from "@/lib/auth";
import { PortalProvider } from "@/lib/portal";
import { SettingsSectionContent } from "./SettingsSectionContent";

const meta = {
  title: "Organisms/SettingsSectionContent",
  component: SettingsSectionContent,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <AuthProvider>
        <PortalProvider>
          <div className="mx-auto max-w-2xl bg-background px-8 py-16">
            <Story />
          </div>
        </PortalProvider>
      </AuthProvider>
    ),
  ],
  args: {
    sectionId: "email-accounts",
  },
} satisfies Meta<typeof SettingsSectionContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Gated by auth/portal — shows config/loading/unlinked states without a live session. */
export const EmailAccounts: Story = {};

export const Members: Story = {
  args: {
    sectionId: "members",
  },
};

export const ApiKeys: Story = {
  args: {
    sectionId: "api-keys",
  },
};

export const ApiDocumentation: Story = {
  args: {
    sectionId: "api-documentation",
  },
};

export const BrandingPlaceholder: Story = {
  args: {
    sectionId: "branding",
  },
};
