import type { Meta, StoryObj } from "@storybook/react";
import { PortalUserMenu } from "./PortalUserMenu";

const meta = {
  title: "Features/Portal/PortalUserMenu",
  component: PortalUserMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    email: "owner@example.com",
    name: "Ada Lovelace",
    onSignOut: () => undefined,
  },
} satisfies Meta<typeof PortalUserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmailOnly: Story = {
  args: {
    name: null,
  },
};

export const NamedUser: Story = {
  args: {
    name: "Ada Lovelace",
    email: "ada@example.com",
  },
};
