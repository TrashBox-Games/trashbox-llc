import type { Meta, StoryObj } from "@storybook/react";
import { GeneralSettings } from "./GeneralSettings";

const meta = {
  title: "Features/Portal/Settings/GeneralSettings",
  component: GeneralSettings,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    email: "ezekielbleh@gmail.com",
    clientName: "Trashbox LLC",
    tier: "basic",
    active: true,
    emailsUsed: 25,
    emailLimit: 1000,
  },
} satisfies Meta<typeof GeneralSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InactivePlan: Story = {
  args: {
    active: false,
    tier: "premium",
  },
};

export const WithoutPlan: Story = {
  args: {
    tier: null,
    emailsUsed: null,
    emailLimit: null,
  },
};
