"use client";

import { useRef, useState } from "react";
import {
  RichTextEditor,
  type RichTextValue,
} from "@/components/atoms/RichTextEditor";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ColumnItem,
  ColumnItemSelection,
  EmailTemplateBlock,
  EmailTemplateColumnsBlock,
  EmailTemplateGridBlock,
  EmailTemplateTableBlock,
} from "@/lib/email-template-document";
import {
  getBlockBoxSize,
  GRID_LIMITS,
  gridCellIndex,
  imageElementStyle,
  resolveColumnWidths,
  resolveTrackSizes,
  parseColumnItems,
  renderColumnItemInner,
  serializeColumnItems,
} from "@/lib/email-template-document";
import {
  isBuilderDrag,
  readBuilderDragData,
  setBlockDragData,
  type BuilderDragPayload,
} from "@/lib/email-template-dnd";
import { BlockResizeHandles } from "@/components/features/portal/settings/template-builder/BlockResizeHandles";
import { cn } from "@/lib/utils";

export interface BuilderBlockProps {
  block: EmailTemplateBlock;
  selected: boolean;
  /** Host for the shared formatting toolbar at the top of the canvas. */
  toolbarPortal?: HTMLElement | null;
  onSelect: () => void;
  onChange: (patch: Partial<EmailTemplateBlock>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  /** Drop a palette variant or existing block into a column cell. */
  onDropInColumn?: (
    columnIndex: number,
    payload: BuilderDragPayload | null,
  ) => void;
  /** Drop into a grid cell. */
  onDropInGridCell?: (
    rowIndex: number,
    columnIndex: number,
    payload: BuilderDragPayload | null,
  ) => void;
  selectedColumnItem?: ColumnItemSelection | null;
  onSelectColumnItem?: (selection: ColumnItemSelection | null) => void;
  /** Selected column container (hierarchy / chrome), not a nested item. */
  selectedColumnIndex?: number | null;
  onSelectColumn?: (columnIndex: number) => void;
  selectedGridCell?: { rowIndex: number; columnIndex: number } | null;
  onSelectGridCell?: (rowIndex: number, columnIndex: number) => void;
  selectedImageTextChild?: "image" | "text" | null;
  onSelectImageTextChild?: (child: "image" | "text") => void;
}

const builderEditorClass =
  "min-h-[3rem] select-text px-0 py-0 text-[15px] leading-relaxed text-[#18181b]";

function isBlankHtml(html: string): boolean {
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .trim();
  return text.length === 0;
}

type ChromeProps = {
  selected: boolean;
  blockId: string;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  width: number | null;
  height: number | null;
  onResize: (size: { width?: number | null; height?: number | null }) => void;
};

function ColumnsBlockEditor({
  block,
  selected,
  toolbarPortal,
  chrome,
  onChange,
  onDropInColumn,
  selectedColumnItem,
  onSelectColumnItem,
  selectedColumnIndex = null,
  onSelectColumn,
}: {
  block: EmailTemplateColumnsBlock;
  selected: boolean;
  toolbarPortal: HTMLElement | null;
  chrome: ChromeProps;
  onChange: (patch: Partial<EmailTemplateBlock>) => void;
  onDropInColumn?: (
    columnIndex: number,
    payload: BuilderDragPayload | null,
  ) => void;
  selectedColumnItem?: ColumnItemSelection | null;
  onSelectColumnItem?: (selection: ColumnItemSelection | null) => void;
  selectedColumnIndex?: number | null;
  onSelectColumn?: (columnIndex: number) => void;
}): React.ReactElement {
  const [activeCol, setActiveCol] = useState(0);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [colEpoch, setColEpoch] = useState<number[]>(() =>
    Array.from({ length: 4 }, () => 0),
  );
  const colCount = Math.min(4, Math.max(2, block.columns.length));

  function updateColumnHtml(columnIndex: number, html: string) {
    const columns = Array.from(
      { length: colCount },
      (_, i) => block.columns[i] ?? "<p><br /></p>",
    );
    columns[columnIndex] = html;
    onChange({ columns });
  }

  function updateItems(columnIndex: number, items: ColumnItem[]) {
    updateColumnHtml(
      columnIndex,
      serializeColumnItems(items, block.itemGap ?? 12),
    );
  }

  function updateItemGapBefore(
    columnIndex: number,
    itemIndex: number,
    gapBefore: number,
  ) {
    const items = parseColumnItems(block.columns[columnIndex] ?? "");
    if (itemIndex <= 0 || itemIndex >= items.length) return;
    items[itemIndex] = { ...items[itemIndex]!, gapBefore };
    updateItems(columnIndex, items);
  }

  function isItemSelected(columnIndex: number, itemIndex: number): boolean {
    return (
      selectedColumnItem?.rowIndex == null &&
      selectedColumnItem?.columnIndex === columnIndex &&
      selectedColumnItem?.itemIndex === itemIndex
    );
  }

  return (
    <BlockChrome {...chrome}>
      <div
        className="grid gap-y-3"
        style={{
          columnGap: block.columnGap ?? 24,
          gridTemplateColumns: resolveColumnWidths(
            block.columnWidths,
            colCount,
          )
            .map((width) => `${width}fr`)
            .join(" "),
        }}
        data-testid="builder-columns-grid"
      >
        {Array.from({ length: colCount }, (_, index) => {
          const items = parseColumnItems(block.columns[index] ?? "");
          const showItemList = items.length > 0;

          return (
            <div
              key={index}
              data-testid={`builder-column-drop-${index}`}
              aria-label={`Drop into column ${index + 1}`}
              className={cn(
                "min-h-24 border border-dashed p-2 transition-colors",
                hoverCol === index
                  ? "border-sky-500 bg-sky-50"
                  : selectedColumnIndex === index
                    ? "border-sky-400 bg-sky-50/70"
                    : "border-zinc-200",
              )}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("[data-testid^=builder-column-item-]")) {
                  return;
                }
                event.stopPropagation();
                onSelectColumn?.(index);
              }}
              onFocusCapture={() => setActiveCol(index)}
              onDragEnter={(event) => {
                if (!isBuilderDrag(event.dataTransfer)) return;
                event.preventDefault();
                event.stopPropagation();
                setHoverCol(index);
              }}
              onDragOver={(event) => {
                if (!isBuilderDrag(event.dataTransfer)) return;
                event.preventDefault();
                event.stopPropagation();
                event.dataTransfer.dropEffect =
                  event.dataTransfer.effectAllowed === "move" ? "move" : "copy";
                setHoverCol(index);
              }}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node)) {
                  return;
                }
                setHoverCol((current) => (current === index ? null : current));
              }}
              onDrop={(event) => {
                if (!isBuilderDrag(event.dataTransfer)) return;
                event.preventDefault();
                event.stopPropagation();
                setHoverCol(null);
                onDropInColumn?.(index, readBuilderDragData(event.dataTransfer));
                setColEpoch((current) => {
                  const next = [...current];
                  next[index] = (next[index] ?? 0) + 1;
                  return next;
                });
              }}
            >
              {showItemList ? (
                <div className="space-y-0">
                  {items.map((item, itemIndex) => {
                    const itemSelected = isItemSelected(index, itemIndex);
                    const gapPx =
                      itemIndex === 0
                        ? 0
                        : (item.gapBefore ?? block.itemGap ?? 12);
                    return (
                      <div key={`${block.id}-${index}-item-${itemIndex}`}>
                        <div
                          role="button"
                          tabIndex={0}
                          data-testid={`builder-column-item-${index}-${itemIndex}`}
                          aria-label={`${item.kind} item ${itemIndex + 1}`}
                          aria-pressed={itemSelected}
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectColumnItem?.({
                              columnIndex: index,
                              itemIndex,
                            });
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              onSelectColumnItem?.({
                                columnIndex: index,
                                itemIndex,
                              });
                            }
                          }}
                          style={
                            gapPx > 0 ? { paddingTop: gapPx } : undefined
                          }
                          className={cn(
                            "relative rounded border px-1 py-1 text-left text-[15px] leading-relaxed transition-colors",
                            itemSelected
                              ? "border-sky-500 bg-sky-50/80 ring-1 ring-sky-500"
                              : "border-transparent hover:border-sky-300 hover:bg-sky-50/40",
                          )}
                        >
                          {itemIndex > 0 && selected ? (
                            <div
                              className="pointer-events-auto absolute left-0 right-0 z-10 flex items-center gap-2 px-1"
                              style={{
                                top: 0,
                                height: Math.max(20, Math.min(gapPx || 20, 36)),
                              }}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="h-px flex-1 bg-sky-200" />
                              <label className="flex items-center gap-1 rounded bg-white/95 px-1 text-[10px] text-sky-700 shadow-sm ring-1 ring-sky-100">
                                <span className="sr-only">
                                  Gap before item {itemIndex + 1}
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  aria-label={`Gap before item ${itemIndex + 1}`}
                                  value={String(gapPx)}
                                  onChange={(event) => {
                                    let raw = event.target.value.replace(
                                      /[^\d]/g,
                                      "",
                                    );
                                    if (raw === "") raw = "0";
                                    if (raw.length > 1) {
                                      raw = raw.replace(/^0+/, "") || "0";
                                    }
                                    const next = Number(raw);
                                    updateItemGapBefore(
                                      index,
                                      itemIndex,
                                      Number.isFinite(next)
                                        ? Math.min(200, Math.max(0, next))
                                        : (block.itemGap ?? 12),
                                    );
                                  }}
                                  className="h-6 w-14 rounded border border-sky-200 bg-white px-1 text-[11px] text-[#18181b]"
                                />
                                <span>px</span>
                              </label>
                              <div className="h-px flex-1 bg-sky-200" />
                            </div>
                          ) : null}
                          {item.kind === "text" && itemSelected ? (
                            <div
                              onMouseDown={(event) => event.stopPropagation()}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <RichTextEditor
                                key={`${block.id}-col-${index}-item-${itemIndex}-${colEpoch[index] ?? 0}`}
                                ariaLabel={`Column ${index + 1} text item`}
                                placeholder="Column text…"
                                initialHtml={item.html}
                                onChange={(value: RichTextValue) => {
                                  const next = [...items];
                                  next[itemIndex] = {
                                    ...item,
                                    html: value.html,
                                  };
                                  updateItems(index, next);
                                }}
                                showToolbar={activeCol === index}
                                acceptMergeFieldDrops
                                toolbarPortal={
                                  activeCol === index ? toolbarPortal : null
                                }
                                className="border-0 bg-transparent"
                                editorClassName={builderEditorClass}
                              />
                            </div>
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: renderColumnItemInner(item),
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : selected ? (
                <RichTextEditor
                  key={`${block.id}-col-${index}-${colEpoch[index] ?? 0}`}
                  ariaLabel={`Column ${index + 1}`}
                  placeholder="Column text… or drop a component here"
                  initialHtml={block.columns[index] ?? ""}
                  onChange={(value: RichTextValue) => {
                    updateItems(index, [
                      {
                        kind: "text",
                        html: value.html,
                        gapBefore: null,
                      },
                    ]);
                  }}
                  showToolbar={activeCol === index}
                  acceptMergeFieldDrops
                  toolbarPortal={activeCol === index ? toolbarPortal : null}
                  className="border-0 bg-transparent"
                  editorClassName={builderEditorClass}
                />
              ) : (
                <div
                  className="px-0 py-0 text-[15px] leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: serializeColumnItems(items, block.itemGap ?? 12),
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </BlockChrome>
  );
}

function GridBlockEditor({
  block,
  selected,
  toolbarPortal,
  chrome,
  onChange,
  onDropInGridCell,
  selectedColumnItem,
  onSelectColumnItem,
  selectedGridCell = null,
  onSelectGridCell,
}: {
  block: EmailTemplateGridBlock;
  selected: boolean;
  toolbarPortal: HTMLElement | null;
  chrome: ChromeProps;
  onChange: (patch: Partial<EmailTemplateBlock>) => void;
  onDropInGridCell?: (
    rowIndex: number,
    columnIndex: number,
    payload: BuilderDragPayload | null,
  ) => void;
  selectedColumnItem?: ColumnItemSelection | null;
  onSelectColumnItem?: (selection: ColumnItemSelection | null) => void;
  selectedGridCell?: { rowIndex: number; columnIndex: number } | null;
  onSelectGridCell?: (rowIndex: number, columnIndex: number) => void;
}): React.ReactElement {
  const [activeCell, setActiveCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [hoverCell, setHoverCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [cellEpoch, setCellEpoch] = useState(0);

  const rows = Math.min(
    GRID_LIMITS.maxRows,
    Math.max(GRID_LIMITS.minRows, block.rows),
  );
  const cols = Math.min(
    GRID_LIMITS.maxColumns,
    Math.max(GRID_LIMITS.minColumns, block.columns),
  );
  const colWidths = resolveTrackSizes(block.columnWidths, cols);
  const rowHeights = resolveTrackSizes(block.rowHeights, rows);

  function cellHtml(rowIndex: number, columnIndex: number): string {
    return (
      block.cells[gridCellIndex(rowIndex, columnIndex, cols)] ??
      "<p><br /></p>"
    );
  }

  function updateCellHtml(
    rowIndex: number,
    columnIndex: number,
    html: string,
  ) {
    const cells = Array.from(
      { length: rows * cols },
      (_, flat) => block.cells[flat] ?? "<p><br /></p>",
    );
    cells[gridCellIndex(rowIndex, columnIndex, cols)] = html;
    onChange({ cells, rows, columns: cols });
  }

  function updateItems(
    rowIndex: number,
    columnIndex: number,
    items: ColumnItem[],
  ) {
    updateCellHtml(
      rowIndex,
      columnIndex,
      serializeColumnItems(items, block.itemGap ?? 12),
    );
  }

  function updateItemGapBefore(
    rowIndex: number,
    columnIndex: number,
    itemIndex: number,
    gapBefore: number,
  ) {
    const items = parseColumnItems(cellHtml(rowIndex, columnIndex));
    if (itemIndex <= 0 || itemIndex >= items.length) return;
    items[itemIndex] = { ...items[itemIndex]!, gapBefore };
    updateItems(rowIndex, columnIndex, items);
  }

  function isItemSelected(
    rowIndex: number,
    columnIndex: number,
    itemIndex: number,
  ): boolean {
    return (
      selectedColumnItem?.rowIndex === rowIndex &&
      selectedColumnItem?.columnIndex === columnIndex &&
      selectedColumnItem?.itemIndex === itemIndex
    );
  }

  return (
    <BlockChrome {...chrome}>
      <div
        className="grid"
        style={{
          columnGap: block.columnGap ?? 16,
          rowGap: block.rowGap ?? 16,
          gridTemplateColumns: colWidths.map((width) => `${width}fr`).join(" "),
          gridTemplateRows: rowHeights.map((height) => `${height}fr`).join(" "),
        }}
        data-testid="builder-grid"
      >
        {Array.from({ length: rows }, (_, rowIndex) =>
          Array.from({ length: cols }, (_, columnIndex) => {
            const items = parseColumnItems(cellHtml(rowIndex, columnIndex));
            const showItemList = items.length > 0;
            const hovered =
              hoverCell?.row === rowIndex && hoverCell?.col === columnIndex;
            const active =
              activeCell?.row === rowIndex && activeCell?.col === columnIndex;
            const pad = Math.max(0, block.cellPadding ?? 0);

            return (
              <div
                key={`${rowIndex}-${columnIndex}`}
                data-testid={`builder-grid-drop-${rowIndex}-${columnIndex}`}
                aria-label={`Drop into grid cell row ${rowIndex + 1} column ${columnIndex + 1}`}
                className={cn(
                  "min-h-20 border border-dashed transition-colors",
                  hovered
                    ? "border-sky-500 bg-sky-50"
                    : selectedGridCell?.rowIndex === rowIndex &&
                        selectedGridCell?.columnIndex === columnIndex
                      ? "border-sky-400 bg-sky-50/70"
                      : "border-zinc-200",
                )}
                style={{ padding: pad }}
                onClick={(event) => {
                  if (
                    (event.target as HTMLElement).closest(
                      "[data-testid^=builder-grid-item-]",
                    )
                  ) {
                    return;
                  }
                  event.stopPropagation();
                  onSelectGridCell?.(rowIndex, columnIndex);
                }}
                onFocusCapture={() =>
                  setActiveCell({ row: rowIndex, col: columnIndex })
                }
                onDragEnter={(event) => {
                  if (!isBuilderDrag(event.dataTransfer)) return;
                  event.preventDefault();
                  event.stopPropagation();
                  setHoverCell({ row: rowIndex, col: columnIndex });
                }}
                onDragOver={(event) => {
                  if (!isBuilderDrag(event.dataTransfer)) return;
                  event.preventDefault();
                  event.stopPropagation();
                  event.dataTransfer.dropEffect =
                    event.dataTransfer.effectAllowed === "move"
                      ? "move"
                      : "copy";
                  setHoverCell({ row: rowIndex, col: columnIndex });
                }}
                onDragLeave={(event) => {
                  if (
                    event.currentTarget.contains(event.relatedTarget as Node)
                  ) {
                    return;
                  }
                  setHoverCell((current) =>
                    current?.row === rowIndex && current.col === columnIndex
                      ? null
                      : current,
                  );
                }}
                onDrop={(event) => {
                  if (!isBuilderDrag(event.dataTransfer)) return;
                  event.preventDefault();
                  event.stopPropagation();
                  setHoverCell(null);
                  onDropInGridCell?.(
                    rowIndex,
                    columnIndex,
                    readBuilderDragData(event.dataTransfer),
                  );
                  setCellEpoch((value) => value + 1);
                }}
              >
                {showItemList ? (
                  <div className="space-y-0">
                    {items.map((item, itemIndex) => {
                      const itemSelected = isItemSelected(
                        rowIndex,
                        columnIndex,
                        itemIndex,
                      );
                      const gapPx =
                        itemIndex === 0
                          ? 0
                          : (item.gapBefore ?? block.itemGap ?? 12);
                      return (
                        <div
                          key={`${block.id}-${rowIndex}-${columnIndex}-item-${itemIndex}`}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            data-testid={`builder-grid-item-${rowIndex}-${columnIndex}-${itemIndex}`}
                            aria-label={`${item.kind} item ${itemIndex + 1}`}
                            aria-pressed={itemSelected}
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectColumnItem?.({
                                rowIndex,
                                columnIndex,
                                itemIndex,
                              });
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                event.preventDefault();
                                event.stopPropagation();
                                onSelectColumnItem?.({
                                  rowIndex,
                                  columnIndex,
                                  itemIndex,
                                });
                              }
                            }}
                            style={
                              gapPx > 0 ? { paddingTop: gapPx } : undefined
                            }
                            className={cn(
                              "relative rounded border px-1 py-1 text-left text-[15px] leading-relaxed transition-colors",
                              itemSelected
                                ? "border-sky-500 bg-sky-50/80 ring-1 ring-sky-500"
                                : "border-transparent hover:border-sky-300 hover:bg-sky-50/40",
                            )}
                          >
                            {itemIndex > 0 && selected ? (
                              <div
                                className="pointer-events-auto absolute left-0 right-0 z-10 flex items-center gap-2 px-1"
                                style={{
                                  top: 0,
                                  height: Math.max(
                                    20,
                                    Math.min(gapPx || 20, 36),
                                  ),
                                }}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <div className="h-px flex-1 bg-sky-200" />
                                <label className="flex items-center gap-1 rounded bg-white/95 px-1 text-[10px] text-sky-700 shadow-sm ring-1 ring-sky-100">
                                  <span className="sr-only">
                                    Gap before item {itemIndex + 1}
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    aria-label={`Gap before item ${itemIndex + 1}`}
                                    value={String(gapPx)}
                                    onChange={(event) => {
                                      let raw = event.target.value.replace(
                                        /[^\d]/g,
                                        "",
                                      );
                                      if (raw === "") raw = "0";
                                      if (raw.length > 1) {
                                        raw = raw.replace(/^0+/, "") || "0";
                                      }
                                      const next = Number(raw);
                                      updateItemGapBefore(
                                        rowIndex,
                                        columnIndex,
                                        itemIndex,
                                        Number.isFinite(next)
                                          ? Math.min(200, Math.max(0, next))
                                          : (block.itemGap ?? 12),
                                      );
                                    }}
                                    className="h-6 w-14 rounded border border-sky-200 bg-white px-1 text-[11px] text-[#18181b]"
                                  />
                                  <span>px</span>
                                </label>
                                <div className="h-px flex-1 bg-sky-200" />
                              </div>
                            ) : null}
                            {item.kind === "text" && itemSelected ? (
                              <div
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <RichTextEditor
                                  key={`${block.id}-grid-${rowIndex}-${columnIndex}-item-${itemIndex}-${cellEpoch}`}
                                  ariaLabel={`Grid cell ${rowIndex + 1},${columnIndex + 1} text item`}
                                  placeholder="Cell text…"
                                  initialHtml={item.html}
                                  onChange={(value: RichTextValue) => {
                                    const next = [...items];
                                    next[itemIndex] = {
                                      ...item,
                                      html: value.html,
                                    };
                                    updateItems(rowIndex, columnIndex, next);
                                  }}
                                  showToolbar={active}
                                  acceptMergeFieldDrops
                                  toolbarPortal={active ? toolbarPortal : null}
                                  className="border-0 bg-transparent"
                                  editorClassName={builderEditorClass}
                                />
                              </div>
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: renderColumnItemInner(item),
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : selected ? (
                  <RichTextEditor
                    key={`${block.id}-grid-${rowIndex}-${columnIndex}-${cellEpoch}`}
                    ariaLabel={`Grid cell row ${rowIndex + 1} column ${columnIndex + 1}`}
                    placeholder="Cell text… or drop a component here"
                    initialHtml={cellHtml(rowIndex, columnIndex)}
                    onChange={(value: RichTextValue) => {
                      updateItems(rowIndex, columnIndex, [
                        {
                          kind: "text",
                          html: value.html,
                          gapBefore: null,
                        },
                      ]);
                    }}
                    showToolbar={active}
                    acceptMergeFieldDrops
                    toolbarPortal={active ? toolbarPortal : null}
                    className="border-0 bg-transparent"
                    editorClassName={builderEditorClass}
                  />
                ) : (
                  <div
                    className="px-0 py-0 text-[15px] leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: serializeColumnItems(
                        items,
                        block.itemGap ?? 12,
                      ),
                    }}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
    </BlockChrome>
  );
}

function TableBlockEditor({
  block,
  selected,
  chrome,
  onChange,
}: {
  block: EmailTemplateTableBlock;
  selected: boolean;
  chrome: ChromeProps;
  onChange: (patch: Partial<EmailTemplateBlock>) => void;
}): React.ReactElement {
  return (
    <BlockChrome {...chrome}>
      <table
        className="w-full border-collapse text-sm"
        style={{
          fontFamily: block.fontFamily,
          fontSize: block.fontSize,
        }}
      >
        <tbody>
          {block.rows.map((row, rowIndex) => {
            const isHeader = rowIndex === 0;
            return (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="align-top"
                    style={{
                      border: `1px solid ${block.borderColor}`,
                      padding: block.cellPadding,
                      backgroundColor: isHeader
                        ? block.headerBackgroundColor
                        : block.cellBackgroundColor,
                      color: isHeader
                        ? block.headerTextColor
                        : block.cellTextColor,
                      fontWeight: isHeader
                        ? block.headerFontWeight
                        : block.fontWeight,
                    }}
                  >
                    {selected ? (
                      <Input
                        aria-label={`Cell ${rowIndex + 1}, ${cellIndex + 1}`}
                        value={cell}
                        onChange={(event) => {
                          const rows = block.rows.map((r) => [...r]);
                          rows[rowIndex]![cellIndex] = event.target.value;
                          onChange({ rows });
                        }}
                        className="border-0 bg-transparent p-0 shadow-none"
                        style={{
                          color: isHeader
                            ? block.headerTextColor
                            : block.cellTextColor,
                          fontFamily: block.fontFamily,
                          fontSize: block.fontSize,
                          fontWeight: isHeader
                            ? block.headerFontWeight
                            : block.fontWeight,
                        }}
                      />
                    ) : (
                      cell || "\u00a0"
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </BlockChrome>
  );
}

function BlockChrome({
  selected,
  blockId,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  width,
  height,
  onResize,
  children,
}: ChromeProps & { children: React.ReactNode }): React.ReactElement {
  const frameRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      // Avoid role="button" while editing — browsers block text selection inside buttons.
      role={selected ? undefined : "button"}
      tabIndex={selected ? undefined : 0}
      ref={frameRef}
      data-testid="builder-block-frame"
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onKeyDown={(event) => {
        if (selected) return;
        const target = event.target as HTMLElement | null;
        if (
          target?.isContentEditable ||
          target?.closest?.(
            '[contenteditable="true"], input, textarea, select',
          )
        ) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative bg-transparent p-0 text-left text-[#18181b]",
        selected ? "ring-2 ring-sky-500" : "cursor-pointer",
      )}
      style={{
        width: width != null && width > 0 ? width : undefined,
        maxWidth: "100%",
        minHeight: height != null && height > 0 ? height : undefined,
        height: undefined,
      }}
    >
      {selected && (
        <div
          className="absolute top-0 left-full z-20 ml-[calc(2.5rem+0.75rem)] flex flex-col gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            aria-label="Drag to reorder"
            draggable
            onDragStart={(event) => {
              event.stopPropagation();
              setBlockDragData(event.dataTransfer, blockId);
            }}
            className="cursor-grab border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 active:cursor-grabbing"
          >
            <MaterialIcon name="drag_indicator" className="text-sm" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            aria-label="Move up"
            disabled={!canMoveUp}
            onClick={(event) => {
              event.stopPropagation();
              onMoveUp();
            }}
            className="border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            <MaterialIcon name="arrow_upward" className="text-sm" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            aria-label="Move down"
            disabled={!canMoveDown}
            onClick={(event) => {
              event.stopPropagation();
              onMoveDown();
            }}
            className="border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            <MaterialIcon name="arrow_downward" className="text-sm" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            aria-label="Duplicate block"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate();
            }}
            className="border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            <MaterialIcon name="content_copy" className="text-sm" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            aria-label="Delete block"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            <MaterialIcon name="delete" className="text-sm" />
          </Button>
        </div>
      )}
      {children}
      {selected ? (
        <BlockResizeHandles
          width={width}
          height={height}
          measure={() => {
            const rect = frameRef.current?.getBoundingClientRect();
            return {
              width: rect?.width ?? 200,
              height: rect?.height ?? 80,
            };
          }}
          onChange={onResize}
        />
      ) : null}
    </div>
  );
}

export function BuilderBlock({
  block,
  selected,
  toolbarPortal = null,
  onSelect,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDropInColumn,
  onDropInGridCell,
  selectedColumnItem = null,
  onSelectColumnItem,
  selectedColumnIndex = null,
  onSelectColumn,
  selectedGridCell = null,
  onSelectGridCell,
  selectedImageTextChild = null,
  onSelectImageTextChild,
}: BuilderBlockProps): React.ReactElement {
  const box = getBlockBoxSize(block);
  const chrome: ChromeProps = {
    selected,
    blockId: block.id,
    onSelect,
    onDuplicate,
    onDelete,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
    width: box.width,
    height: box.height,
    onResize: (size) => onChange(size),
  };

  switch (block.type) {
    case "text":
      return (
        <BlockChrome {...chrome}>
          {selected ? (
            <div
              onMouseDown={(event) => event.stopPropagation()}
              className="select-text"
            >
              <RichTextEditor
                key={block.id}
                ariaLabel="Text block"
                placeholder="Type your text here…"
                initialHtml={block.html}
                onChange={(value: RichTextValue) =>
                  onChange({ html: value.html })
                }
                showToolbar
                acceptMergeFieldDrops
                toolbarPortal={toolbarPortal}
                className="border-0 bg-transparent"
                editorClassName={builderEditorClass}
              />
            </div>
          ) : isBlankHtml(block.html) ? (
            <p className="min-h-10 px-0 py-0 text-[15px] italic leading-relaxed text-zinc-400">
              Type your text here…
            </p>
          ) : (
            <div
              className="min-h-10 prose prose-sm max-w-none px-0 py-0 text-[15px] leading-relaxed text-[#18181b]"
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          )}
        </BlockChrome>
      );
    case "image":
      return (
        <BlockChrome {...chrome}>
          {block.src ? (
            <div
              data-testid="builder-image-align"
              style={{
                textAlign: block.align ?? "left",
                padding: `${block.paddingY ?? 0}px ${block.paddingX ?? 0}px`,
              }}
            >
              {(() => {
                const img = (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={block.src}
                    alt={block.alt}
                    style={imageElementStyle({
                      fit: block.fit ?? "fit",
                      width: block.width,
                      height: block.height,
                      borderRadius: block.borderRadius,
                      borderWidth: block.borderWidth,
                      borderColor: block.borderColor,
                    })}
                  />
                );
                const href = (block.href ?? "").trim();
                if (!href) return img;
                return (
                  <a
                    href={href}
                    target={block.openInNewTab ? "_blank" : undefined}
                    rel={block.openInNewTab ? "noopener noreferrer" : undefined}
                    className="inline-block no-underline"
                    onClick={(event) => event.preventDefault()}
                  >
                    {img}
                  </a>
                );
              })()}
            </div>
          ) : (
            <div className="flex h-28 max-w-full items-center justify-center overflow-hidden bg-zinc-100 px-2 text-sm text-zinc-500">
              <span className="truncate">Add image URL</span>
            </div>
          )}
        </BlockChrome>
      );
    case "spacer":
      return (
        <BlockChrome {...chrome}>
          <div
            style={{ height: block.height }}
            className="flex items-center justify-center border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-500"
          >
            Spacer ({block.height}px)
          </div>
        </BlockChrome>
      );
    case "imageText":
      return (
        <BlockChrome {...chrome}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              role="button"
              tabIndex={0}
              data-testid={`builder-imagetext-image-${block.id}`}
              aria-pressed={selectedImageTextChild === "image"}
              className={cn(
                "rounded border border-transparent p-1",
                block.imagePosition === "right" ? "sm:order-2" : undefined,
                selectedImageTextChild === "image" &&
                  "border-sky-400 bg-sky-50/70",
              )}
              onClick={(event) => {
                event.stopPropagation();
                onSelectImageTextChild?.("image");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectImageTextChild?.("image");
                }
              }}
            >
              {block.image.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={block.image.src}
                  alt={block.image.alt}
                  className="w-full object-contain"
                  style={imageElementStyle({
                    fit: block.image.fit ?? "fit",
                    borderRadius: block.image.borderRadius,
                    borderWidth: block.image.borderWidth,
                    borderColor: block.image.borderColor,
                  })}
                />
              ) : (
                <div className="flex h-24 items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                  Image
                </div>
              )}
            </div>
            <div
              role="button"
              tabIndex={0}
              data-testid={`builder-imagetext-text-${block.id}`}
              aria-pressed={selectedImageTextChild === "text"}
              className={cn(
                "rounded border border-transparent p-1",
                block.imagePosition === "right" ? "sm:order-1" : undefined,
                selectedImageTextChild === "text" &&
                  "border-sky-400 bg-sky-50/70",
              )}
              onClick={(event) => {
                event.stopPropagation();
                onSelectImageTextChild?.("text");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectImageTextChild?.("text");
                }
              }}
            >
              {selected &&
              (selectedImageTextChild === "text" ||
                selectedImageTextChild == null) ? (
                <div
                  onMouseDown={(event) => event.stopPropagation()}
                  className="select-text"
                >
                  <RichTextEditor
                    key={block.id}
                    ariaLabel="Image text"
                    placeholder="Type your text here…"
                    initialHtml={block.text.html}
                    onChange={(value: RichTextValue) =>
                      onChange({
                        text: { html: value.html },
                      } as Partial<EmailTemplateBlock>)
                    }
                    showToolbar
                    acceptMergeFieldDrops
                    toolbarPortal={toolbarPortal}
                    className="border-0 bg-transparent"
                    editorClassName={builderEditorClass}
                  />
                </div>
              ) : isBlankHtml(block.text.html) ? (
                <p className="min-h-10 px-0 py-0 text-[15px] italic leading-relaxed text-zinc-400">
                  Type your text here…
                </p>
              ) : (
                <div
                  className="px-0 py-0 text-[15px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: block.text.html }}
                />
              )}
            </div>
          </div>
        </BlockChrome>
      );
    case "button":
      return (
        <BlockChrome {...chrome}>
          <div
            className={cn(
              "py-2",
              block.align === "left" && "text-left",
              block.align === "center" && "text-center",
              block.align === "right" && "text-right",
            )}
          >
            <span
              className="inline-block"
              style={{
                backgroundColor: block.backgroundColor,
                color: block.textColor,
                borderRadius: block.borderRadius,
                border:
                  block.borderWidth > 0
                    ? `${block.borderWidth}px solid ${block.borderColor}`
                    : "0",
                padding: `${block.paddingY}px ${block.paddingX}px`,
                fontFamily: block.fontFamily,
                fontSize: block.fontSize,
                fontWeight: block.fontWeight,
                lineHeight: 1.2,
              }}
            >
              {block.label}
            </span>
          </div>
        </BlockChrome>
      );
    case "columns":
      return (
        <ColumnsBlockEditor
          block={block}
          selected={selected}
          toolbarPortal={toolbarPortal}
          chrome={chrome}
          onChange={onChange}
          onDropInColumn={onDropInColumn}
          selectedColumnItem={selectedColumnItem}
          onSelectColumnItem={onSelectColumnItem}
          selectedColumnIndex={selectedColumnIndex}
          onSelectColumn={onSelectColumn}
        />
      );
    case "grid":
      return (
        <GridBlockEditor
          block={block}
          selected={selected}
          toolbarPortal={toolbarPortal}
          chrome={chrome}
          onChange={onChange}
          onDropInGridCell={onDropInGridCell}
          selectedColumnItem={selectedColumnItem}
          onSelectColumnItem={onSelectColumnItem}
          selectedGridCell={selectedGridCell}
          onSelectGridCell={onSelectGridCell}
        />
      );
    case "table":
      return (
        <TableBlockEditor
          block={block}
          selected={selected}
          chrome={chrome}
          onChange={onChange}
        />
      );
    case "html":
      return (
        <BlockChrome {...chrome}>
          {selected ? (
            <textarea
              aria-label="HTML block"
              value={block.html}
              onChange={(event) => onChange({ html: event.target.value })}
              className="min-h-40 w-full border border-zinc-300 bg-white p-2 font-mono text-xs text-[#18181b]"
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: block.html }} />
          )}
        </BlockChrome>
      );
  }
}
