import type { Meta, StoryObj } from "@storybook/react";
import { ApiDocsSettings } from "./ApiDocsSettings";

const meta = {
  title: "Features/Settings/ApiDocsSettings",
  component: ApiDocsSettings,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl bg-background px-8 py-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ApiDocsSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
