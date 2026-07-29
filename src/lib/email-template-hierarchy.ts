import {
  BLOCK_TYPE_LABELS,
  parseColumnItems,
  type ColumnItem,
  type EmailTemplateBlock,
  type EmailTemplateDocument,
} from "@/lib/email-template-document";
import type { BuilderSelection } from "@/lib/email-template-selection";

export type HierarchyNodeKind =
  | "pageBand"
  | "block"
  | "column"
  | "gridCell"
  | "columnItem"
  | "imageTextChild";

export interface HierarchyNode {
  id: string;
  label: string;
  icon: string;
  selection: BuilderSelection;
  children?: HierarchyNode[];
}

function columnItemLabel(item: ColumnItem): string {
  switch (item.kind) {
    case "text":
      return "Text";
    case "image":
      return "Image";
    case "button":
      return "Button";
    case "spacer":
      return "Blank Space";
    case "html":
      return "HTML";
  }
}

function columnItemIcon(item: ColumnItem): string {
  switch (item.kind) {
    case "text":
      return "title";
    case "image":
      return "image";
    case "button":
      return "smart_button";
    case "spacer":
      return "expand";
    case "html":
      return "code";
  }
}

function blockIcon(type: EmailTemplateBlock["type"]): string {
  switch (type) {
    case "text":
      return "title";
    case "image":
      return "image";
    case "spacer":
      return "expand";
    case "imageText":
      return "art_track";
    case "button":
      return "smart_button";
    case "columns":
      return "view_column";
    case "grid":
      return "grid_view";
    case "table":
      return "table";
    case "html":
      return "code";
  }
}

function columnItemNodes(
  blockId: string,
  columnIndex: number,
  html: string,
  rowIndex?: number,
): HierarchyNode[] {
  return parseColumnItems(html).map((item, itemIndex) => ({
    id:
      rowIndex != null
        ? `${blockId}:cell-${rowIndex}-${columnIndex}:item-${itemIndex}`
        : `${blockId}:col-${columnIndex}:item-${itemIndex}`,
    label: columnItemLabel(item),
    icon: columnItemIcon(item),
    selection: {
      kind: "columnItem",
      blockId,
      columnIndex,
      itemIndex,
      ...(rowIndex != null ? { rowIndex } : {}),
    },
  }));
}

function blockToHierarchyNode(block: EmailTemplateBlock): HierarchyNode {
  const base: HierarchyNode = {
    id: block.id,
    label: BLOCK_TYPE_LABELS[block.type],
    icon: blockIcon(block.type),
    selection: { kind: "block", blockId: block.id },
  };

  if (block.type === "imageText") {
    return {
      ...base,
      children: [
        {
          id: `${block.id}:image`,
          label: "Image",
          icon: "image",
          selection: {
            kind: "imageTextChild",
            blockId: block.id,
            child: "image",
          },
        },
        {
          id: `${block.id}:text`,
          label: "Text",
          icon: "title",
          selection: {
            kind: "imageTextChild",
            blockId: block.id,
            child: "text",
          },
        },
      ],
    };
  }

  if (block.type === "columns") {
    return {
      ...base,
      children: block.columns.map((html, columnIndex) => ({
        id: `${block.id}:col-${columnIndex}`,
        label: `Column ${columnIndex + 1}`,
        icon: "view_column",
        selection: {
          kind: "column",
          blockId: block.id,
          columnIndex,
        },
        children: columnItemNodes(block.id, columnIndex, html),
      })),
    };
  }

  if (block.type === "grid") {
    const children: HierarchyNode[] = [];
    for (let rowIndex = 0; rowIndex < block.rows; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < block.columns; columnIndex += 1) {
        const flat = rowIndex * block.columns + columnIndex;
        const html = block.cells[flat] ?? "";
        children.push({
          id: `${block.id}:cell-${rowIndex}-${columnIndex}`,
          label: `Cell ${rowIndex + 1},${columnIndex + 1}`,
          icon: "crop_square",
          selection: {
            kind: "gridCell",
            blockId: block.id,
            rowIndex,
            columnIndex,
          },
          children: columnItemNodes(block.id, columnIndex, html, rowIndex),
        });
      }
    }
    return { ...base, children };
  }

  // Button and other leaves stay single nodes.
  return base;
}

/** Build a Figma-style layers tree from the template document. */
export function buildHierarchyTree(
  doc: EmailTemplateDocument,
): HierarchyNode[] {
  const nodes: HierarchyNode[] = [];
  if (doc.header) {
    nodes.push({
      id: "page-band:header",
      label: "Header",
      icon: "vertical_align_top",
      selection: { kind: "pageBand", band: "header" },
    });
  }
  for (const block of doc.blocks) {
    nodes.push(blockToHierarchyNode(block));
  }
  if (doc.footer) {
    nodes.push({
      id: "page-band:footer",
      label: "Footer",
      icon: "vertical_align_bottom",
      selection: { kind: "pageBand", band: "footer" },
    });
  }
  return nodes;
}

/** Collect ancestor node ids that should stay expanded for the current selection. */
export function hierarchyExpandedIdsForSelection(
  tree: HierarchyNode[],
  selection: BuilderSelection,
): Set<string> {
  const expanded = new Set<string>();
  if (selection.kind === "none") return expanded;

  function walk(nodes: HierarchyNode[], ancestors: string[]): boolean {
    for (const node of nodes) {
      const path = [...ancestors, node.id];
      if (JSON.stringify(node.selection) === JSON.stringify(selection)) {
        for (const id of ancestors) expanded.add(id);
        return true;
      }
      if (node.children && walk(node.children, path)) {
        expanded.add(node.id);
        for (const id of ancestors) expanded.add(id);
        return true;
      }
    }
    return false;
  }

  walk(tree, []);
  return expanded;
}
