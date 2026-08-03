import type { Meta, StoryObj } from "@storybook/react";
import type { AccountResponse } from "@/lib/api";
import { ApiKeysSettings } from "./ApiKeysSettings";

const ownerAccount: AccountResponse = {
  linked: true,
  email: "owner@example.com",
  clientName: "Acme",
  tier: "team",
  active: true,
  hasBilling: true,
  hasApiKey: false,
  role: "owner",
};

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
      account: ownerAccount,
    },
  },
};

export const KeyActive: Story = {
  args: {
    initialState: {
      canManage: true,
      account: { ...ownerAccount, hasApiKey: true },
    },
  },
};

export const KeyJustCreated: Story = {
  name: "Key just created",
  args: {
    initialState: {
      canManage: true,
      issuedApiKey: "fapi_storybook_demo_key_do_not_use",
      account: { ...ownerAccount, hasApiKey: true },
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
