import type { Meta, StoryObj } from "@storybook/react";
import { AuthProvider } from "@/lib/auth";
import { PortalLoginPage } from "./PortalPage";

const meta = {
  title: "Features/Leads/PortalLoginPage",
  component: PortalLoginPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <div className="mx-auto max-w-screen-2xl px-8 pt-32 pb-24">
          <Story />
        </div>
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof PortalLoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
