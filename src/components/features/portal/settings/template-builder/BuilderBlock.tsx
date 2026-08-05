"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  RichTextEditor,
  type RichTextValue,
} from "@/components/atoms/RichTextEditor";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
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
  boxChromeCssStyle,
  COLUMN_LIMITS,
  getBlockBoxChrome,
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
  isMergeFieldDrag,
  readBuilderDragData,
  setBlockDragData,
  type BuilderDragPayload,
} from "@/lib/email-template-dnd";
import { BlockResizeHandles } from "@/components/features/portal/settings/template-builder/BlockResizeHandles";
import { cn } from "@/lib/utils";

export interface BuilderBlockProps {
  block: EmailTemplateBlock;
  selected: boolean;
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

/** Keep in sync with unselected text preview so selecting a block doesn’t grow it. */
const builderTextSurfaceClass =
  "min-h-10 min-w-0 break-words [overflow-wrap:anywhere] px-0 py-0 text-[15px] leading-relaxed text-[#18181b] [&_p]:my-0 [&_h1]:my-0 [&_h2]:my-0 [&_h3]:my-0";
const builderEditorClass = `select-text ${builderTextSurfaceClass}`;

/** Space/Enter activate role=button chrome — skip when typing in nested editors. */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return Boolean(
    el.isContentEditable ||
      el.closest?.('[contenteditable="true"], input, textarea, select'),
  );
}

function isBlankHtml(html: string): boolean {
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .trim();
  return text.length === 0;
}

function blockChromeLabel(type: EmailTemplateBlock["type"]): string {
  switch (type) {
    case "columns":
      return "Section";
    case "grid":
      return "Grid";
    case "text":
      return "Text";
    case "button":
      return "Button";
    case "image":
      return "Image";
    case "imageText":
      return "Image text";
    case "spacer":
      return "Spacer";
    case "table":
      return "Table";
    case "html":
      return "HTML";
    default:
      return "Block";
  }
}

function columnItemLabel(kind: ColumnItem["kind"]): string {
  switch (kind) {
    case "text":
      return "Text";
    case "button":
      return "Button";
    case "image":
      return "Image";
    case "spacer":
      return "Spacer";
    case "html":
      return "HTML";
    default:
      return "Item";
  }
}

type SectionHoverApi = {
  setSectionHovered: (hovered: boolean) => void;
  setNestedHovered: (hovered: boolean) => void;
};

const SectionHoverContext = createContext<SectionHoverApi | null>(null);

function NestedItemChrome({
  label,
  selected,
  testId,
  ariaLabel,
  onSelect,
  onDelete,
  style,
  children,
}: {
  label: string;
  selected: boolean;
  testId: string;
  ariaLabel: string;
  onSelect: () => void;
  onDelete?: () => void;
  style?: CSSProperties;
  children: ReactNode;
}): React.ReactElement {
  const sectionHover = useContext(SectionHoverContext);
  const [hovered, setHovered] = useState(false);
  const showChrome = selected || hovered;

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-pressed={selected}
      style={style}
      onMouseEnter={() => {
        setHovered(true);
        sectionHover?.setNestedHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        sectionHover?.setNestedHovered(false);
        // Leaving nested content into section padding should hover the section.
        sectionHover?.setSectionHovered(true);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onKeyDown={(event) => {
        if (isTypingTarget(event.target)) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onSelect();
        }
      }}
      className={cn(
        "relative min-w-0 flow-root rounded-none bg-transparent p-0 text-left text-[15px] leading-relaxed break-words [overflow-wrap:anywhere] transition-colors",
        selected
          ? "outline-1 outline-sky-500 outline-offset-0"
          : hovered
            ? "outline-1 outline-sky-500/45 outline-offset-0"
            : "outline-none",
      )}
    >
      {showChrome ? (
        <div
          data-testid="builder-nested-tag"
          data-tb-tag-state={selected ? "selected" : "hover"}
          className={cn(
            "absolute top-0 left-0 z-30 flex h-5 -translate-y-full items-stretch rounded-none text-[11px] leading-none text-white",
            selected ? "bg-sky-500" : "bg-sky-500/55",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <span className="flex items-center px-1.5 font-medium whitespace-nowrap">
            {label}
          </span>
          {selected && onDelete ? (
            <button
              type="button"
              aria-label={`Delete ${label}`}
              className="flex size-5 items-center justify-center rounded-none hover:bg-sky-600"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              <MaterialIcon name="delete" className="text-sm" />
            </button>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

type ChromeProps = {
  selected: boolean;
  blockId: string;
  label: string;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  /**
   * Editor-only: widen the section outline past the page and only allow
   * section hover/select from the side bleed (nested content wins otherwise).
   */
  sectionBleed?: boolean;
  width: number | null;
  height: number | null;
  boxStyle?: CSSProperties;
  onResize: (size: { width?: number | null; height?: number | null }) => void;
};

function ColumnsBlockEditor({
  block,
  selected,
  chrome,
  onChange,
  onDropInColumn,
  selectedColumnItem,
  onSelectColumnItem,
  selectedColumnIndex: _selectedColumnIndex = null,
  onSelectColumn,
}: {
  block: EmailTemplateColumnsBlock;
  selected: boolean;
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
  void _selectedColumnIndex;
  const [activeCol, setActiveCol] = useState(0);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [colEpoch, setColEpoch] = useState<number[]>(() =>
    Array.from({ length: COLUMN_LIMITS.maxColumns }, () => 0),
  );
  const colCount = Math.min(
    COLUMN_LIMITS.maxColumns,
    Math.max(COLUMN_LIMITS.minColumns, block.columns.length),
  );
  const columnWidths = resolveColumnWidths(block.columnWidths, colCount);
  const widthSum = columnWidths.reduce((total, value) => total + value, 0);
  const centerColumns = widthSum < 100;

  const cellPad = Math.max(0, block.cellPadding ?? 0);
  const valign =
    block.cellVerticalAlign === "middle"
      ? "center"
      : block.cellVerticalAlign === "bottom"
        ? "flex-end"
        : "flex-start";
  const alignClass =
    block.align === "center"
      ? "mx-auto"
      : block.align === "right"
        ? "ml-auto"
        : undefined;

  function updateColumnHtml(columnIndex: number, html: string) {
    const columns = Array.from(
      { length: colCount },
      (_, i) => block.columns[i] ?? "<p><br /></p>",
    );
    columns[columnIndex] = html;
    onChange({ columns });
  }

  function handleDeleteColumn(columnIndex: number) {
    if (block.columns.length <= 1) {
      chrome.onDelete();
      return;
    }
    const nextColumns = block.columns.filter((_, index) => index !== columnIndex);
    const nextWidths = columnWidths.filter((_, index) => index !== columnIndex);
    const nextSum = nextWidths.reduce((total, value) => total + value, 0);
    onChange({
      columns: nextColumns,
      columnWidths: nextWidths,
      align: nextSum < 100 ? "center" : block.align,
    });
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
      <SectionPaddingSurface
        testId="builder-columns-chrome"
        className={cn("box-border", alignClass)}
        style={{
          backgroundColor: block.backgroundColor || "transparent",
          borderWidth: Math.max(0, block.borderWidth ?? 0),
          borderStyle: (block.borderWidth ?? 0) > 0 ? "solid" : undefined,
          borderColor: block.borderColor,
          borderRadius: Math.max(0, block.borderRadius ?? 0),
          padding: `${Math.max(0, block.paddingY ?? 0)}px ${Math.max(0, block.paddingX ?? 0)}px`,
        }}
        onSelectPadding={chrome.onSelect}
      >
        <div
          className="grid"
          style={{
            columnGap: block.columnGap ?? 24,
            rowGap: 0,
            gridTemplateColumns: columnWidths
              .map((width) => (centerColumns ? `${width}%` : `${width}fr`))
              .join(" "),
            justifyContent: centerColumns ? "center" : undefined,
            alignItems: valign,
          }}
          data-testid="builder-columns-grid"
        >
        {Array.from({ length: colCount }, (_, index) => {
          const items = parseColumnItems(block.columns[index] ?? "");
          const showItemList = items.length > 0;
          const isPlaceholder = !showItemList;

          return (
            <div
              key={index}
              data-testid={`builder-column-drop-${index}`}
              data-builder-nested-drop=""
              aria-label={`Drop into column ${index + 1}`}
              className={cn(
                "relative min-w-0 rounded-none bg-transparent transition-colors",
                isPlaceholder
                  ? "min-h-24 border border-dashed border-sky-300/70 bg-zinc-100"
                  : "min-h-0",
                hoverCol === index &&
                  (isPlaceholder
                    ? "border-sky-500"
                    : "outline-1 outline-sky-500/50 -outline-offset-1"),
              )}
              style={{
                padding: Math.max(isPlaceholder ? 8 : 0, cellPad),
                paddingTop: isPlaceholder
                  ? Math.max(28, cellPad + 4)
                  : Math.max(0, cellPad),
              }}
              onClick={(event) => {
                if (
                  (event.target as HTMLElement).closest(
                    "[data-testid^=builder-column-item-], [data-testid^=builder-column-delete-]",
                  )
                ) {
                  return;
                }
                event.stopPropagation();
                onSelectColumn?.(index);
              }}
              onFocusCapture={() => setActiveCol(index)}
              onDragEnter={(event) => {
                if (!isBuilderDrag(event.dataTransfer)) return;
                if (isMergeFieldDrag(event.dataTransfer)) return;
                event.preventDefault();
                event.stopPropagation();
                setHoverCol(index);
              }}
              onDragOver={(event) => {
                if (!isBuilderDrag(event.dataTransfer)) return;
                if (isMergeFieldDrag(event.dataTransfer)) {
                  event.dataTransfer.dropEffect = "none";
                  return;
                }
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
                if (isMergeFieldDrag(event.dataTransfer)) {
                  setHoverCol(null);
                  return;
                }
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
              {isPlaceholder ? (
                <button
                  type="button"
                  data-testid={`builder-column-delete-${index}`}
                  aria-label={`Delete column ${index + 1}`}
                  className="absolute top-1 left-1 z-20 flex size-6 items-center justify-center rounded-none border border-zinc-300 bg-zinc-200 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-800"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteColumn(index);
                  }}
                >
                  <MaterialIcon name="delete" className="text-sm" />
                </button>
              ) : null}
              {hoverCol === index ? (
                <div
                  data-testid="builder-insert-to-column"
                  className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
                >
                  <span className="rounded-none bg-sky-500 px-2 py-1 text-[11px] font-medium text-white shadow-sm">
                    Insert to Column
                  </span>
                </div>
              ) : null}
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
                        <NestedItemChrome
                          label={columnItemLabel(item.kind)}
                          selected={itemSelected}
                          testId={`builder-column-item-${index}-${itemIndex}`}
                          ariaLabel={`${item.kind} item ${itemIndex + 1}`}
                          style={
                            gapPx > 0 ? { paddingTop: gapPx } : undefined
                          }
                          onSelect={() =>
                            onSelectColumnItem?.({
                              columnIndex: index,
                              itemIndex,
                            })
                          }
                          onDelete={() => {
                            const next = items.filter(
                              (_, i) => i !== itemIndex,
                            );
                            updateItems(index, next);
                          }}
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
                              <label className="flex items-center gap-1 rounded-none bg-white/95 px-1 text-[10px] text-sky-700 shadow-sm outline-1 outline-sky-100">
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
                                  className="h-6 w-14 rounded-none border border-sky-200 bg-white px-1 text-[11px] text-[#18181b]"
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
                                placeholder=""
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
                                toolbarOverlay={activeCol === index}
                                acceptMergeFieldDrops
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
                        </NestedItemChrome>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="min-h-16" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
      </SectionPaddingSurface>
    </BlockChrome>
  );
}

function GridBlockEditor({
  block,
  selected,
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
      <SectionPaddingSurface
        testId="builder-grid-chrome"
        className={cn(
          "box-border",
          block.align === "center"
            ? "mx-auto"
            : block.align === "right"
              ? "ml-auto"
              : undefined,
        )}
        style={{
          backgroundColor: block.backgroundColor || "transparent",
          borderWidth: Math.max(0, block.borderWidth ?? 0),
          borderStyle: (block.borderWidth ?? 0) > 0 ? "solid" : undefined,
          borderColor: block.borderColor,
          borderRadius: Math.max(0, block.borderRadius ?? 0),
          padding: `${Math.max(0, block.paddingY ?? 0)}px ${Math.max(0, block.paddingX ?? 0)}px`,
        }}
        onSelectPadding={chrome.onSelect}
      >
      <div
        className="grid"
        style={{
          columnGap: block.columnGap ?? 16,
          rowGap: block.rowGap ?? 16,
          gridTemplateColumns: colWidths.map((width) => `${width}fr`).join(" "),
          gridTemplateRows: rowHeights.map((height) => `${height}fr`).join(" "),
          alignItems:
            block.cellVerticalAlign === "middle"
              ? "center"
              : block.cellVerticalAlign === "bottom"
                ? "flex-end"
                : "flex-start",
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
                data-builder-nested-drop=""
                aria-label={`Drop into grid cell row ${rowIndex + 1} column ${columnIndex + 1}`}
                className={cn(
                  "relative min-h-20 rounded-none bg-transparent transition-colors",
                  !showItemList &&
                    "border border-dashed border-sky-300/70 bg-zinc-100",
                  hovered
                    ? "border-sky-500 outline-1 outline-sky-500 outline-offset-0"
                    : "outline-none",
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
                  if (isMergeFieldDrag(event.dataTransfer)) return;
                  event.preventDefault();
                  event.stopPropagation();
                  setHoverCell({ row: rowIndex, col: columnIndex });
                }}
                onDragOver={(event) => {
                  if (!isBuilderDrag(event.dataTransfer)) return;
                  if (isMergeFieldDrag(event.dataTransfer)) {
                    event.dataTransfer.dropEffect = "none";
                    return;
                  }
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
                  if (isMergeFieldDrag(event.dataTransfer)) {
                    setHoverCell(null);
                    return;
                  }
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
                {hovered ? (
                  <div
                    data-testid="builder-insert-to-column"
                    className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
                  >
                    <span className="rounded-none bg-sky-500 px-2 py-1 text-[11px] font-medium text-white shadow-sm">
                      Insert to Column
                    </span>
                  </div>
                ) : null}
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
                          <NestedItemChrome
                            label={columnItemLabel(item.kind)}
                            selected={itemSelected}
                            testId={`builder-grid-item-${rowIndex}-${columnIndex}-${itemIndex}`}
                            ariaLabel={`${item.kind} item ${itemIndex + 1}`}
                            style={
                              gapPx > 0 ? { paddingTop: gapPx } : undefined
                            }
                            onSelect={() =>
                              onSelectColumnItem?.({
                                rowIndex,
                                columnIndex,
                                itemIndex,
                              })
                            }
                            onDelete={() => {
                              const next = items.filter(
                                (_, i) => i !== itemIndex,
                              );
                              updateItems(rowIndex, columnIndex, next);
                            }}
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
                                  placeholder=""
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
                                  toolbarOverlay={active}
                                  acceptMergeFieldDrops
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
                          </NestedItemChrome>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="min-h-16" aria-hidden="true" />
                )}
              </div>
            );
          }),
        )}
      </div>
      </SectionPaddingSurface>
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

/** Editor-only: how far section/grid outlines extend past the 600px page. */
const SECTION_BLEED_CLASS = "-mx-10 px-10";
const SECTION_BLEED_HIT_CLASS =
  "absolute inset-y-0 z-[5] w-10 cursor-pointer";

/**
 * Layout chrome padding shell: hovering/clicking the pad (not nested items)
 * targets the parent section.
 */
function SectionPaddingSurface({
  testId,
  className,
  style,
  onSelectPadding,
  children,
}: {
  testId: string;
  className?: string;
  style?: CSSProperties;
  onSelectPadding: () => void;
  children: ReactNode;
}): React.ReactElement {
  const sectionHover = useContext(SectionHoverContext);
  return (
    <div
      data-testid={testId}
      className={className}
      style={style}
      onMouseEnter={() => sectionHover?.setSectionHovered(true)}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        event.stopPropagation();
        onSelectPadding();
      }}
    >
      {children}
    </div>
  );
}

function BlockChrome({
  selected,
  blockId,
  label,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  sectionBleed = false,
  width,
  height,
  boxStyle,
  onResize,
  children,
}: ChromeProps & { children: React.ReactNode }): React.ReactElement {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [nestedHovered, setNestedHovered] = useState(false);
  const showSectionHover = hovered && !nestedHovered;
  const showChrome = selected || showSectionHover;
  const tagState = selected ? "selected" : "hover";
  const sectionHoverApi = useMemo<SectionHoverApi>(
    () => ({
      setSectionHovered: setHovered,
      setNestedHovered,
    }),
    [],
  );

  function selectBlock(event: ReactMouseEvent) {
    event.stopPropagation();
    onSelect();
  }

  function clearHover() {
    setHovered(false);
    setNestedHovered(false);
  }

  const frame = (
    <div
      // Avoid role="button" while editing — browsers block text selection inside buttons.
      // Sections only select from side bleed hit-targets so nested content wins hover/click.
      role={selected || sectionBleed ? undefined : "button"}
      tabIndex={selected || sectionBleed ? undefined : 0}
      ref={frameRef}
      data-testid="builder-block-frame"
      data-tb-section-bleed={sectionBleed ? "true" : "false"}
      onMouseEnter={sectionBleed ? undefined : () => setHovered(true)}
      onMouseLeave={clearHover}
      onClick={sectionBleed ? undefined : selectBlock}
      onKeyDown={
        sectionBleed
          ? undefined
          : (event) => {
              if (selected) return;
              if (isTypingTarget(event.target)) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect();
              }
            }
      }
      className={cn(
        // flow-root keeps child paragraph margins inside the outline so
        // adjacent block outlines can sit flush against each other.
        "relative flow-root rounded-none bg-transparent text-left text-[#18181b]",
        sectionBleed ? SECTION_BLEED_CLASS : "mx-0 px-0",
        selected
          ? "outline-2 outline-sky-500 outline-offset-0"
          : showSectionHover
            ? "outline-1 outline-sky-500/40 outline-offset-0"
            : "outline-none",
        !sectionBleed && "cursor-pointer",
      )}
      style={{
        ...boxStyle,
        width: width != null && width > 0 ? width : undefined,
        maxWidth: sectionBleed ? "none" : "100%",
        minHeight: height != null && height > 0 ? height : undefined,
        height: undefined,
      }}
    >
      {sectionBleed ? (
        <>
          <div
            data-testid="builder-section-bleed-left"
            aria-label={`Select ${label}`}
            className={cn(SECTION_BLEED_HIT_CLASS, "left-0")}
            onMouseEnter={() => setHovered(true)}
            onClick={selectBlock}
          />
          <div
            data-testid="builder-section-bleed-right"
            aria-label={`Select ${label}`}
            className={cn(SECTION_BLEED_HIT_CLASS, "right-0")}
            onMouseEnter={() => setHovered(true)}
            onClick={selectBlock}
          />
        </>
      ) : null}
      {showChrome ? (
        <div
          data-testid="builder-block-tag"
          data-tb-tag-state={tagState}
          className={cn(
            "absolute top-0 left-0 z-30 flex h-5 -translate-y-full items-stretch rounded-none text-[11px] leading-none text-white",
            selected ? "bg-sky-500" : "bg-sky-500/55",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <span className="flex items-center px-1.5 font-medium whitespace-nowrap">
            {label}
          </span>
          {selected ? (
            <div className="flex items-stretch">
              <button
                type="button"
                aria-label="Drag to reorder"
                draggable
                onDragStart={(event) => {
                  event.stopPropagation();
                  setBlockDragData(event.dataTransfer, blockId);
                }}
                className="flex size-5 cursor-grab items-center justify-center rounded-none hover:bg-sky-600 active:cursor-grabbing"
              >
                <MaterialIcon name="drag_indicator" className="text-sm" />
              </button>
              <button
                type="button"
                aria-label="Move up"
                disabled={!canMoveUp}
                onClick={(event) => {
                  event.stopPropagation();
                  onMoveUp();
                }}
                className="flex size-5 items-center justify-center rounded-none hover:bg-sky-600 disabled:opacity-40"
              >
                <MaterialIcon name="arrow_upward" className="text-sm" />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={!canMoveDown}
                onClick={(event) => {
                  event.stopPropagation();
                  onMoveDown();
                }}
                className="flex size-5 items-center justify-center rounded-none hover:bg-sky-600 disabled:opacity-40"
              >
                <MaterialIcon name="arrow_downward" className="text-sm" />
              </button>
              <button
                type="button"
                aria-label="Duplicate block"
                onClick={(event) => {
                  event.stopPropagation();
                  onDuplicate();
                }}
                className="flex size-5 items-center justify-center rounded-none hover:bg-sky-600"
              >
                <MaterialIcon name="content_copy" className="text-sm" />
              </button>
              <button
                type="button"
                aria-label="Delete block"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                className="flex size-5 items-center justify-center rounded-none hover:bg-sky-600"
              >
                <MaterialIcon name="delete" className="text-sm" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div
        data-testid={sectionBleed ? "builder-section-content" : undefined}
        className="relative"
      >
        {children}
      </div>
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

  if (!sectionBleed) return frame;

  return (
    <SectionHoverContext.Provider value={sectionHoverApi}>
      {frame}
    </SectionHoverContext.Provider>
  );
}

export function BuilderBlock({
  block,
  selected,
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
  // Only the leaf selection shows chrome — nested text/column/cell selection
  // must not also outline/tag the parent section.
  const hasNestedSelection =
    selectedColumnItem != null ||
    selectedColumnIndex != null ||
    selectedGridCell != null ||
    selectedImageTextChild != null;
  const chromeSelected = selected && !hasNestedSelection;
  const chrome: ChromeProps = {
    selected: chromeSelected,
    blockId: block.id,
    label: blockChromeLabel(block.type),
    onSelect,
    onDuplicate,
    onDelete,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
    sectionBleed: block.type === "columns" || block.type === "grid",
    width: box.width,
    height: box.height,
    boxStyle: (() => {
      const boxChrome = getBlockBoxChrome(block);
      return boxChrome
        ? (boxChromeCssStyle(boxChrome) as CSSProperties)
        : undefined;
    })(),
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
                toolbarOverlay
                acceptMergeFieldDrops
                className="border-0 bg-transparent"
                editorClassName={builderEditorClass}
              />
            </div>
          ) : isBlankHtml(block.html) ? (
            <p
              data-testid="builder-text-preview"
              className={cn(builderTextSurfaceClass, "italic text-zinc-400")}
            >
              Type your text here…
            </p>
          ) : (
            <div
              data-testid="builder-text-preview"
              className={builderTextSurfaceClass}
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
                "rounded-none p-1",
                block.imagePosition === "right" ? "sm:order-2" : undefined,
                selectedImageTextChild === "image"
                  ? "outline-1 outline-sky-500 -outline-offset-1"
                  : "outline-none hover:outline-1 hover:outline-sky-500/40 hover:-outline-offset-1",
              )}
              onClick={(event) => {
                event.stopPropagation();
                onSelectImageTextChild?.("image");
              }}
              onKeyDown={(event) => {
                if (isTypingTarget(event.target)) return;
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
                "rounded-none p-1",
                block.imagePosition === "right" ? "sm:order-1" : undefined,
                selectedImageTextChild === "text"
                  ? "outline-1 outline-sky-500 -outline-offset-1"
                  : "outline-none hover:outline-1 hover:outline-sky-500/40 hover:-outline-offset-1",
              )}
              onClick={(event) => {
                event.stopPropagation();
                onSelectImageTextChild?.("text");
              }}
              onKeyDown={(event) => {
                if (isTypingTarget(event.target)) return;
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
                    toolbarOverlay
                    acceptMergeFieldDrops
                    className="border-0 bg-transparent"
                    editorClassName={builderEditorClass}
                  />
                </div>
              ) : isBlankHtml(block.text.html) ? (
                <p className={cn(builderTextSurfaceClass, "italic text-zinc-400")}>
                  Type your text here…
                </p>
              ) : (
                <div
                  className={builderTextSurfaceClass}
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
