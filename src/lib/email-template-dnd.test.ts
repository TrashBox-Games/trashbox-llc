import { describe, expect, it } from "vitest";
import {
  appendBlock,
  emptyDocument,
  insertVariantAt,
  moveBlockToIndex,
} from "@/lib/email-template-document";
import {
  isMergeFieldDrag,
  readBuilderDragData,
  resolveInsertIndex,
  setBlockDragData,
  setVariantDragData,
  TB_MERGE_MIME,
} from "@/lib/email-template-dnd";

describe("email template drag helpers", () => {
  it("inserts a variant at a specific index", () => {
    let doc = emptyDocument();
    doc = appendBlock(doc, "text");
    doc = appendBlock(doc, "button");
    doc = insertVariantAt(doc, 1, "columns-2");
    expect(doc.blocks.map((block) => block.type)).toEqual([
      "text",
      "columns",
      "button",
    ]);
  });

  it("moves a block to a target index", () => {
    let doc = emptyDocument();
    doc = appendBlock(doc, "text");
    doc = appendBlock(doc, "button");
    doc = appendBlock(doc, "spacer");
    const [first, second, third] = doc.blocks;
    doc = moveBlockToIndex(doc, third!.id, 0);
    expect(doc.blocks.map((block) => block.id)).toEqual([
      third!.id,
      first!.id,
      second!.id,
    ]);
    doc = moveBlockToIndex(doc, third!.id, 3);
    expect(doc.blocks.map((block) => block.id)).toEqual([
      first!.id,
      second!.id,
      third!.id,
    ]);
  });

  it("round-trips drag payloads through dataTransfer-like storage", () => {
    const store = new Map<string, string>();
    const dataTransfer = {
      setData: (type: string, value: string) => {
        store.set(type, value);
      },
      getData: (type: string) => store.get(type) ?? "",
      effectAllowed: "none" as DataTransfer["effectAllowed"],
      types: [] as string[],
    } as unknown as DataTransfer;

    setVariantDragData(dataTransfer, "columns-3");
    expect(readBuilderDragData(dataTransfer)).toEqual({
      kind: "variant",
      variantId: "columns-3",
    });
    expect(isMergeFieldDrag(dataTransfer)).toBe(false);

    store.clear();
    setBlockDragData(dataTransfer, "block-1");
    expect(readBuilderDragData(dataTransfer)).toEqual({
      kind: "block",
      blockId: "block-1",
    });
  });

  it("marks merge-field variants with a dedicated mime type", () => {
    const store = new Map<string, string>();
    const types: string[] = [];
    const dataTransfer = {
      setData: (type: string, value: string) => {
        store.set(type, value);
        if (!types.includes(type)) types.push(type);
      },
      getData: (type: string) => store.get(type) ?? "",
      effectAllowed: "none" as DataTransfer["effectAllowed"],
      types,
    } as unknown as DataTransfer;

    setVariantDragData(dataTransfer, "merge-lead.first_name");
    expect(store.get(TB_MERGE_MIME)).toBe("merge-lead.first_name");
    expect(isMergeFieldDrag(dataTransfer)).toBe(true);
    expect(readBuilderDragData(dataTransfer)).toEqual({
      kind: "variant",
      variantId: "merge-lead.first_name",
    });
  });

  it("resolves insert index from pointer Y and block midpoints", () => {
    const rects = [
      { top: 0, height: 100 },
      { top: 120, height: 100 },
      { top: 240, height: 100 },
    ];
    expect(resolveInsertIndex(10, rects)).toBe(0);
    expect(resolveInsertIndex(80, rects)).toBe(1);
    expect(resolveInsertIndex(200, rects)).toBe(2);
    expect(resolveInsertIndex(400, rects)).toBe(3);
  });
});
