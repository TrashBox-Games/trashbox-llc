import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { BuilderHierarchyPanel } from "./BuilderHierarchyPanel";
import {
  appendBlock,
  appendVariant,
  defaultFooterBand,
  defaultHeaderBand,
  emptyDocument,
  insertVariantIntoColumn,
} from "@/lib/email-template-document";

let doc = emptyDocument();
doc = { ...doc, header: defaultHeaderBand(), footer: defaultFooterBand() };
doc = appendVariant(doc, "columns-2");
doc = insertVariantIntoColumn(doc, doc.blocks[0]!.id, 0, "image-single");
doc = insertVariantIntoColumn(doc, doc.blocks[0]!.id, 0, "text-paragraph");
doc = appendVariant(doc, "imageText-left");
doc = appendBlock(doc, "button");

const meta = {
  title: "Features/Portal/Settings/BuilderHierarchyPanel",
  component: BuilderHierarchyPanel,
  tags: ["autodocs"],
  args: {
    document: doc,
    selection: { kind: "none" as const },
    onSelect: fn(),
  },
} satisfies Meta<typeof BuilderHierarchyPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NestedSelection: Story = {
  args: {
    selection: {
      kind: "columnItem",
      blockId: doc.blocks[0]!.id,
      columnIndex: 0,
      itemIndex: 0,
    },
  },
};
