import type { Meta, StoryObj } from "@storybook/react";
import { ApiKeysSettings } from "./ApiKeysSettings";

const meta = {
  title: "Features/Settings/ApiKeysSettings",
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

/** Loads account state from the API — shows skeleton then live/error UI. */
export const Default: Story = {};
