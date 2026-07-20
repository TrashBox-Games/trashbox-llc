import type { Meta, StoryObj } from "@storybook/react";
import { TeamMembersSettings } from "./TeamMembersSettings";

const meta = {
  title: "Organisms/TeamMembersSettings",
  component: TeamMembersSettings,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl bg-background px-8 py-16">
        <Story />
      </div>
    ),
  ],
  args: {
    currentUserEmail: "owner@example.com",
    tier: "premium",
  },
} satisfies Meta<typeof TeamMembersSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Loads team from the API — shows skeleton then TeamPanel or error. */
export const Default: Story = {};

export const BasicTier: Story = {
  name: "Basic tier",
  args: {
    tier: "basic",
  },
};
