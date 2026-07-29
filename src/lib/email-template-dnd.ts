/** HTML5 drag-and-drop payload helpers for the email template builder. */

export const TB_VARIANT_MIME = "application/x-tb-variant";
export const TB_BLOCK_MIME = "application/x-tb-block";

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
  dataTransfer.effectAllowed = "copy";
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

/**
 * Pick the insert index for a pointer Y against block rects.
 * Uses each block’s vertical midpoint: above midpoint → insert before that block.
 */
export function resolveInsertIndex(
  clientY: number,
  blockRects: ReadonlyArray<{ top: number; height: number }>,
): number {
  if (!Number.isFinite(clientY) || blockRects.length === 0) {
    return blockRects.length;
  }
  for (let i = 0; i < blockRects.length; i++) {
    const rect = blockRects[i]!;
    const mid = rect.top + rect.height / 2;
    if (clientY < mid) return i;
  }
  return blockRects.length;
}
