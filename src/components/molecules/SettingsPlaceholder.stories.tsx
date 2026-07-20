import type { Meta, StoryObj } from "@storybook/react";
import { SettingsPlaceholder } from "./SettingsPlaceholder";

const meta = {
  title: "Molecules/SettingsPlaceholder",
  component: SettingsPlaceholder,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComingSoon: Story = {
  args: {
    sectionId: "branding",
    title: "Branding",
  },
};

export const ApiDocumentation: Story = {
  args: {
    sectionId: "api-documentation",
    title: "API Documentation",
  },
};
