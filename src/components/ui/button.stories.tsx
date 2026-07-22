import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Send Invite",
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Cancel",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Learn more",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Secondary",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Continue",
  },
};

export const FullWidth: Story = {
  args: {
    size: "xl",
    children: "Send Transmission",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Saving…",
  },
};
