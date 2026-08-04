/** HTML5 drag-and-drop payload helpers for the email template builder. */

import { isMergeFieldVariant } from "@/lib/email-content";

export const TB_VARIANT_MIME = "application/x-tb-variant";
export const TB_BLOCK_MIME = "application/x-tb-block";
/** Present when dragging a merge-field variant (readable during dragover via types). */
export const TB_MERGE_MIME = "application/x-tb-merge";

const VARIANT_PREFIX = "tb-variant:";
const BLOCK_PREFIX = "tb-block:";

export type BuilderDragPayload =
  | { kind: "variant"; variantId: string }
  | { kind: "block"; blockId: string };

export function setVariantDragData(
  dataTransfer: DataTransfer,
  variantId: string,
): void {
  dataTransfer.setData(TB_VARIANT_MIME, variantId);
  dataTransfer.setData("text/plain", `${VARIANT_PREFIX}${variantId}`);
  if (isMergeFieldVariant(variantId)) {
    dataTransfer.setData(TB_MERGE_MIME, variantId);
  }
  dataTransfer.effectAllowed = "copy";
}

/** Ghost matching the on-canvas merge chip while dragging from the palette. */
export function setMergeFieldDragImage(
  dataTransfer: DataTransfer,
  token: string,
): void {
  if (typeof document === "undefined") return;
  const ghost = document.createElement("span");
  ghost.textContent = token;
  ghost.setAttribute("data-tb-merge-drag-ghost", "1");
  Object.assign(ghost.style, {
    position: "fixed",
    top: "-1000px",
    left: "-1000px",
    display: "inline-block",
    border: "1px solid #0ea5e9",
    background: "#e0f2fe",
    color: "#0369a1",
    borderRadius: "4px",
    padding: "0 0.35em",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "13px",
    lineHeight: "1.4",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    zIndex: "9999",
  });
  document.body.appendChild(ghost);
  const offsetX = Math.min(ghost.offsetWidth / 2, 24);
  const offsetY = Math.min(ghost.offsetHeight / 2, 10);
  if (typeof dataTransfer.setDragImage === "function") {
    dataTransfer.setDragImage(ghost, offsetX, offsetY);
  }
  const cleanup = () => {
    ghost.remove();
    window.removeEventListener("dragend", cleanup);
  };
  window.addEventListener("dragend", cleanup);
  window.setTimeout(cleanup, 2000);
}

export function setBlockDragData(
  dataTransfer: DataTransfer,
  blockId: string,
): void {
  dataTransfer.setData(TB_BLOCK_MIME, blockId);
  dataTransfer.setData("text/plain", `${BLOCK_PREFIX}${blockId}`);
  dataTransfer.effectAllowed = "move";
}

export function readBuilderDragData(
  dataTransfer: DataTransfer,
): BuilderDragPayload | null {
  const mimeVariant = dataTransfer.getData(TB_VARIANT_MIME);
  if (mimeVariant) {
    return { kind: "variant", variantId: mimeVariant };
  }

  const mimeBlock = dataTransfer.getData(TB_BLOCK_MIME);
  if (mimeBlock) {
    return { kind: "block", blockId: mimeBlock };
  }

  const plain = dataTransfer.getData("text/plain");
  if (plain.startsWith(VARIANT_PREFIX)) {
    return { kind: "variant", variantId: plain.slice(VARIANT_PREFIX.length) };
  }
  if (plain.startsWith(BLOCK_PREFIX)) {
    return { kind: "block", blockId: plain.slice(BLOCK_PREFIX.length) };
  }

  return null;
}

export function isBuilderDrag(dataTransfer: DataTransfer): boolean {
  const types = Array.from(dataTransfer.types ?? []);
  if (
    types.includes(TB_VARIANT_MIME) ||
    types.includes(TB_BLOCK_MIME) ||
    types.includes(TB_MERGE_MIME) ||
    types.includes("text/plain") ||
    types.includes("Text")
  ) {
    return true;
  }
  // Some test environments omit `types` even when getData works.
  try {
    return readBuilderDragData(dataTransfer) != null;
  } catch {
    return false;
  }
}

/** True while a merge-field palette tile is being dragged (types-only check). */
export function isMergeFieldDrag(dataTransfer: DataTransfer): boolean {
  const types = Array.from(dataTransfer.types ?? []);
  if (types.includes(TB_MERGE_MIME)) return true;
  try {
    const payload = readBuilderDragData(dataTransfer);
    return (
      payload?.kind === "variant" && isMergeFieldVariant(payload.variantId)
    );
  } catch {
    return false;
  }
}

export type InsertPlacement = {
  /** Document insert index (0…blockCount). */
  index: number;
  /** Badge names this neighbor with before/after. */
  relation: "before" | "after";
  /** Block index of the named neighbor. */
  anchorIndex: number;
};

/**
 * Pick insert index + which neighbor to name on the badge.
 * Inside a block: top half → before that block; bottom half → after it.
 * In the gap between blocks: flips at the gap midpoint.
 */
export function resolveInsertPlacement(
  clientY: number,
  blockRects: ReadonlyArray<{ top: number; height: number }>,
): InsertPlacement {
  if (!Number.isFinite(clientY) || blockRects.length === 0) {
    return { index: 0, relation: "before", anchorIndex: 0 };
  }

  for (let i = 0; i < blockRects.length; i++) {
    const rect = blockRects[i]!;
    const top = rect.top;
    const bottom = rect.top + rect.height;
    const mid = top + rect.height / 2;

    if (clientY < top) {
      if (i === 0) {
        return { index: 0, relation: "before", anchorIndex: 0 };
      }
      const prev = blockRects[i - 1]!;
      const gapMid = (prev.top + prev.height + top) / 2;
      if (clientY < gapMid) {
        return { index: i, relation: "after", anchorIndex: i - 1 };
      }
      return { index: i, relation: "before", anchorIndex: i };
    }

    if (clientY < bottom) {
      if (clientY < mid) {
        return { index: i, relation: "before", anchorIndex: i };
      }
      return { index: i + 1, relation: "after", anchorIndex: i };
    }
  }

  const last = blockRects.length - 1;
  return {
    index: blockRects.length,
    relation: "after",
    anchorIndex: last,
  };
}

/** Insert index only (see `resolveInsertPlacement` for badge wording). */
export function resolveInsertIndex(
  clientY: number,
  blockRects: ReadonlyArray<{ top: number; height: number }>,
): number {
  return resolveInsertPlacement(clientY, blockRects).index;
}
