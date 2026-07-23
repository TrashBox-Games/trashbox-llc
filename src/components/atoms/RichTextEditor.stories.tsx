import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { RichTextEditor } from "./RichTextEditor";

const meta = {
  title: "Atoms/RichTextEditor",
  component: RichTextEditor,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    ariaLabel: "Reply",
    placeholder: "Type your reply here…",
    onChange: fn(),
  },
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
