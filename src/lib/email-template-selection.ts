import type { ColumnItemSelection } from "@/lib/email-template-document";

/** Unified canvas / hierarchy selection for the email template builder. */
export type BuilderSelection =
  | { kind: "none" }
  | { kind: "pageBand"; band: "header" | "footer" }
  | { kind: "block"; blockId: string }
  | { kind: "imageTextChild"; blockId: string; child: "image" | "text" }
  | { kind: "column"; blockId: string; columnIndex: number }
  | {
      kind: "gridCell";
      blockId: string;
      rowIndex: number;
      columnIndex: number;
    }
  | {
      kind: "columnItem";
      blockId: string;
      columnIndex: number;
      itemIndex: number;
      rowIndex?: number;
    };

export function selectionBlockId(selection: BuilderSelection): string | null {
  switch (selection.kind) {
    case "none":
    case "pageBand":
      return null;
    case "block":
    case "imageTextChild":
    case "column":
    case "gridCell":
    case "columnItem":
      return selection.blockId;
  }
}

export function selectionPageBand(
  selection: BuilderSelection,
): "header" | "footer" | null {
  return selection.kind === "pageBand" ? selection.band : null;
}

export function selectionColumnItem(
  selection: BuilderSelection,
): ColumnItemSelection | null {
  if (selection.kind !== "columnItem") return null;
  return {
    columnIndex: selection.columnIndex,
    itemIndex: selection.itemIndex,
    ...(selection.rowIndex != null ? { rowIndex: selection.rowIndex } : {}),
  };
}

export function selectionImageTextChild(
  selection: BuilderSelection,
): "image" | "text" | null {
  return selection.kind === "imageTextChild" ? selection.child : null;
}

export function selectBlock(blockId: string | null): BuilderSelection {
  return blockId ? { kind: "block", blockId } : { kind: "none" };
}

export function selectPageBand(band: "header" | "footer"): BuilderSelection {
  return { kind: "pageBand", band };
}

export function selectColumnItem(
  blockId: string,
  selection: ColumnItemSelection,
): BuilderSelection {
  return {
    kind: "columnItem",
    blockId,
    columnIndex: selection.columnIndex,
    itemIndex: selection.itemIndex,
    ...(selection.rowIndex != null ? { rowIndex: selection.rowIndex } : {}),
  };
}

export function selectionsEqual(
  a: BuilderSelection,
  b: BuilderSelection,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
