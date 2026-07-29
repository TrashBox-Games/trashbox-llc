import { describe, expect, it } from "vitest";
import {
  appendBlock,
  appendVariant,
  defaultFooterBand,
  defaultHeaderBand,
  emptyDocument,
  insertVariantIntoColumn,
  type EmailTemplateDocument,
} from "@/lib/email-template-document";
import {
  buildHierarchyTree,
  hierarchyExpandedIdsForSelection,
} from "@/lib/email-template-hierarchy";
import {
  selectBlock,
  selectionBlockId,
  selectionColumnItem,
  selectionImageTextChild,
  selectionPageBand,
  selectColumnItem,
  selectPageBand,
} from "@/lib/email-template-selection";

describe("email-template-selection", () => {
  it("derives block / page band / column item / imageText child from selection", () => {
    expect(selectionBlockId(selectBlock("abc"))).toBe("abc");
    expect(selectionBlockId({ kind: "none" })).toBeNull();
    expect(selectionPageBand(selectPageBand("header"))).toBe("header");
    expect(
      selectionColumnItem(
        selectColumnItem("col1", { columnIndex: 1, itemIndex: 0 }),
      ),
    ).toEqual({ columnIndex: 1, itemIndex: 0 });
    expect(
      selectionImageTextChild({
        kind: "imageTextChild",
        blockId: "it1",
        child: "image",
      }),
    ).toBe("image");
  });
});

describe("buildHierarchyTree", () => {
  it("includes header, nested column items, imageText children, leaf button, and footer", () => {
    let doc: EmailTemplateDocument = emptyDocument();
    doc = { ...doc, header: defaultHeaderBand() };
    doc = appendVariant(doc, "columns-2");
    const columnsId = doc.blocks[0]!.id;
    doc = insertVariantIntoColumn(doc, columnsId, 0, "image-single");
    doc = insertVariantIntoColumn(doc, columnsId, 0, "text-paragraph");
    doc = appendVariant(doc, "imageText-left");
    doc = appendBlock(doc, "button");
    doc = { ...doc, footer: defaultFooterBand() };

    const tree = buildHierarchyTree(doc);
    expect(tree.map((n) => n.label)).toEqual([
      "Header",
      "Columns",
      "Image + Text",
      "Button",
      "Footer",
    ]);

    const columns = tree[1]!;
    expect(columns.children).toHaveLength(2);
    expect(columns.children?.[0]?.label).toBe("Column 1");
    expect(columns.children?.[0]?.children?.map((c) => c.label)).toEqual([
      "Image",
      "Text",
    ]);

    const imageText = tree[2]!;
    expect(imageText.children?.map((c) => c.label)).toEqual(["Image", "Text"]);
    expect(imageText.children?.[0]?.selection).toEqual({
      kind: "imageTextChild",
      blockId: imageText.id,
      child: "image",
    });

    const button = tree[3]!;
    expect(button.children).toBeUndefined();
    expect(button.selection).toEqual({ kind: "block", blockId: button.id });
  });

  it("marks ancestors expanded for a nested selection", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-2");
    const columnsId = doc.blocks[0]!.id;
    doc = insertVariantIntoColumn(doc, columnsId, 0, "text-paragraph");
    const tree = buildHierarchyTree(doc);
    const selection = {
      kind: "columnItem" as const,
      blockId: columnsId,
      columnIndex: 0,
      itemIndex: 0,
    };
    const expanded = hierarchyExpandedIdsForSelection(tree, selection);
    expect(expanded.has(columnsId)).toBe(true);
    expect(expanded.has(`${columnsId}:col-0`)).toBe(true);
  });
});
