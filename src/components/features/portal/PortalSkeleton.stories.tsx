import type { Meta, StoryObj } from "@storybook/react";
import { PortalSkeleton } from "./PortalSkeleton";

const meta = {
  title: "Features/Portal/PortalSkeleton",
  component: PortalSkeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-screen-2xl bg-background px-8 py-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PortalSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inbox: Story = {
  args: {
    variant: "inbox",
  },
};

export const Login: Story = {
  args: {
    variant: "login",
  },
};

export const Settings: Story = {
  args: {
    variant: "settings",
  },
};

export const ApiKey: Story = {
  args: {
    variant: "api-key",
  },
};

export const Membership: Story = {
  args: {
    variant: "membership",
  },
};

export const Team: Story = {
  args: {
    variant: "team",
  },
};
