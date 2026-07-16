import type { Meta, StoryObj } from "@storybook/react";
import { AuthProvider } from "@/lib/auth";
import { EmailPortalPage } from "./EmailPortalPage";

const meta = {
  title: "Organisms/EmailPortalPage",
  component: EmailPortalPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof EmailPortalPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
