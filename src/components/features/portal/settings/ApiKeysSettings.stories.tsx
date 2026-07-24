import type { Meta, StoryObj } from "@storybook/react";
import { ApiKeysSettings } from "./ApiKeysSettings";

const meta = {
  title: "Features/Portal/Settings/ApiKeysSettings",
  component: ApiKeysSettings,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl bg-background px-8 py-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ApiKeysSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoKeyIssued: Story = {
  args: {
    initialState: {
      canManage: true,
      account: {
        linked: true,
        email: "owner@example.com",
        clientName: "Acme",
        tier: "premium",
        active: true,
        hasBilling: true,
        hasApiKey: false,
        role: "owner",
      },
    },
  },
};

export const KeyActive: Story = {
  args: {
    initialState: {
      canManage: true,
      account: {
        linked: true,
        email: "owner@example.com",
        clientName: "Acme",
        tier: "premium",
        active: true,
        hasBilling: true,
        hasApiKey: true,
        role: "owner",
      },
    },
  },
};

export const KeyJustCreated: Story = {
  name: "Key just created",
  args: {
    initialState: {
      canManage: true,
      issuedApiKey: "fapi_storybook_demo_key_do_not_use",
      account: {
        linked: true,
        email: "owner@example.com",
        clientName: "Acme",
        tier: "premium",
        active: true,
        hasBilling: true,
        hasApiKey: true,
        role: "owner",
      },
    },
  },
};

export const NoPermission: Story = {
  args: {
    initialState: {
      canManage: false,
      account: {
        linked: true,
        email: "member@example.com",
        role: "member",
        hasApiKey: true,
      },
    },
  },
};
