import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { BuilderCodeSplit } from "./BuilderCodeSplit";
import {
  appendBlock,
  emptyDocument,
} from "@/lib/email-template-document";

let seeded = emptyDocument();
seeded = appendBlock(seeded, "text");
seeded = appendBlock(seeded, "button");
seeded = {
  ...seeded,
  blocks: seeded.blocks.map((block) => {
    if (block.type === "text") {
      return {
        ...block,
        html: "<p>Side-by-side code preview sample.</p>",
      };
    }
    if (block.type === "button") {
      return { ...block, label: "Open portal", href: "https://example.com" };
    }
    return block;
  }),
};

const meta = {
  title: "Features/Portal/Settings/BuilderCodeSplit",
  component: BuilderCodeSplit,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    document: seeded,
    onApply: fn(),
  },
  decorators: [
    (Story) => (
      <div className="flex h-[640px] w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BuilderCodeSplit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
