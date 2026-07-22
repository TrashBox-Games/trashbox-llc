import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-background p-8">
        <Label htmlFor="story-input">Email</Label>
        <Story />
      </div>
    ),
  ],
  args: {
    id: "story-input",
    placeholder: "teammate@company.com",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "locked@example.com",
  },
};
