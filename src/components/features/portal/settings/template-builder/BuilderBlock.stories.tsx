import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { BuilderBlock } from "./BuilderBlock";
import { createBlockFromVariant } from "@/lib/email-template-document";

const columns = createBlockFromVariant("columns-2-50-50");
if (columns.type !== "columns") {
  throw new Error("expected columns");
}

const meta = {
  title: "Features/Portal/Settings/BuilderBlock",
  component: BuilderBlock,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    block: columns,
    selected: true,
    onSelect: fn(),
    onChange: fn(),
    onDuplicate: fn(),
    onDelete: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    canMoveUp: true,
    canMoveDown: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] bg-[#e8e8ec] p-8">
        <div className="bg-white p-2">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof BuilderBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectedSection: Story = {};

export const HoverableSection: Story = {
  args: {
    selected: false,
  },
};

export const CenteredAfterColumnDelete: Story = {
  args: {
    block: {
      ...columns,
      columns: ["<p><br /></p>"],
      columnWidths: [50],
      align: "center",
    },
  },
};
