"use client";

import { useEffect, useRef, useState } from "react";
import {
  RichTextEditor,
  type RichTextValue,
} from "@/components/atoms/RichTextEditor";
import { BuilderBlock } from "@/components/features/portal/settings/template-builder/BuilderBlock";
import type {
  ColumnItemSelection,
  EmailTemplateBlock,
  EmailTemplateDocument,
  EmailTemplatePageBand,
} from "@/lib/email-template-document";
import {
  documentContentPaddingStyle,
  documentPageBackgroundStyle,
} from "@/lib/email-template-document";
import {
  isBuilderDrag,
  isMergeFieldDrag,
  readBuilderDragData,
  resolveInsertIndex,
} from "@/lib/email-template-dnd";
import { cn } from "@/lib/utils";

export interface BuilderCanvasProps {
  document: EmailTemplateDocument;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onChangeBlock: (id: string, patch: Partial<EmailTemplateBlock>) => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: "up" | "down") => void;
  onDropAt: (
    index: number,
    payload: ReturnType<typeof readBuilderDragData>,
  ) => void;
  onDropInColumn?: (
    columnsBlockId: string,
    columnIndex: number,
    payload: ReturnType<typeof readBuilderDragData>,
  ) => void;
  onDropInGridCell?: (
    gridBlockId: string,
    rowIndex: number,
    columnIndex: number,
    payload: ReturnType<typeof readBuilderDragData>,
  ) => void;
  selectedColumnItem?: ColumnItemSelection | null;
  onSelectColumnItem?: (
    blockId: string,
    selection: ColumnItemSelection | null,
  ) => void;
  selectedColumnIndex?: number | null;
  onSelectColumn?: (blockId: string, columnIndex: number) => void;
  selectedGridCell?: { rowIndex: number; columnIndex: number } | null;
  onSelectGridCell?: (
    blockId: string,
    rowIndex: number,
    columnIndex: number,
  ) => void;
  selectedImageTextChild?: "image" | "text" | null;
  onSelectImageTextChild?: (
    blockId: string,
    child: "image" | "text",
  ) => void;
  selectedPageBand?: "header" | "footer" | null;
  onSelectPageBand?: (band: "header" | "footer" | null) => void;
  onChangePageBand?: (
    role: "header" | "footer",
    patch: Partial<EmailTemplatePageBand>,
  ) => void;
  onChangeDocument: (patch: Partial<EmailTemplateDocument>) => void;
  className?: string;
}

function InsertIndicator({ index }: { index: number }): React.ReactElement {
  return (
    <div
      data-testid={`builder-drop-slot-${index}`}
      aria-label={`Insert at position ${index + 1}`}
      className="relative my-1 flex h-14 items-center px-1"
    >
      <div className="h-2 w-full rounded-full bg-sky-500 shadow-[0_0_0_6px_rgba(14,165,233,0.22)]" />
    </div>
  );
}

/** Quiet spacer between blocks when not dragging; keeps vertical rhythm. */
function BlockGap(): React.ReactElement {
  return <div className="h-6" aria-hidden />;
}

function PageBandEditor({
  role,
  band,
  selected,
  toolbarPortal,
  onSelect,
  onChange,
}: {
  role: "header" | "footer";
  band: EmailTemplatePageBand;
  selected: boolean;
  toolbarPortal: HTMLElement | null;
  onSelect: () => void;
  onChange: (patch: Partial<EmailTemplatePageBand>) => void;
}): React.ReactElement {
  const borderStyle =
    role === "header"
      ? {
          borderBottomWidth: band.borderWidth,
          borderBottomStyle:
            band.borderWidth > 0 ? ("solid" as const) : undefined,
          borderBottomColor: band.borderColor,
        }
      : {
          borderTopWidth: band.borderWidth,
          borderTopStyle:
            band.borderWidth > 0 ? ("solid" as const) : undefined,
          borderTopColor: band.borderColor,
        };

  return (
    <div
      data-testid={`builder-page-${role}`}
      role="button"
      tabIndex={0}
      aria-label={role === "header" ? "Email header" : "Email footer"}
      aria-pressed={selected}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onSelect();
        }
      }}
      className={cn(
        "relative text-[#18181b] transition-colors",
        role === "footer" && "mt-0",
        selected
          ? "ring-2 ring-sky-500 ring-offset-0"
          : "hover:ring-1 hover:ring-sky-300",
      )}
      style={{
        backgroundColor:
          band.backgroundColor === "transparent"
            ? undefined
            : band.backgroundColor,
        padding: `${band.paddingY}px ${band.paddingX}px`,
        textAlign: band.align,
        ...borderStyle,
      }}
    >
      {selected ? (
        <div
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <RichTextEditor
            key={`page-band-${role}`}
            ariaLabel={`${role} content`}
            placeholder={`${role === "header" ? "Header" : "Footer"} text…`}
            initialHtml={band.html}
            onChange={(value: RichTextValue) => onChange({ html: value.html })}
            showToolbar
            acceptMergeFieldDrops
            toolbarPortal={toolbarPortal}
            className="border-0 bg-transparent"
            editorClassName="min-h-[2.5rem] select-text px-0 py-0 text-[15px] leading-relaxed text-[#18181b]"
          />
        </div>
      ) : (
        <div
          className="px-0 py-0 text-[15px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: band.html || "<p><br /></p>" }}
        />
      )}    </div>
  );
}

export function BuilderCanvas({
  document: doc,
  selectedBlockId,
  onSelectBlock,
  onChangeBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveBlock,
  onDropAt,
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
  selectedPageBand = null,
  onSelectPageBand,
  onChangePageBand,
  onChangeDocument,
  className,
}: BuilderCanvasProps): React.ReactElement {
  const [toolbarHost, setToolbarHost] = useState<HTMLDivElement | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dropIndexRef = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  function clearDropVisual() {
    setDropIndex(null);
  }

  function clearDropState() {
    dropIndexRef.current = null;
    setDropIndex(null);
  }

  // Nested column/grid drops stopPropagation, so the page drop handler never
  // runs. Clear the insert bar on any drop under the canvas (capture) and on
  // dragend (covers cancel / drop outside). Keep the ref until handleDrop so
  // page-level drops still know the insert index.
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const onDropCapture = () => {
      clearDropVisual();
    };
    const onDragEnd = () => {
      clearDropState();
    };

    surface.addEventListener("drop", onDropCapture, true);
    window.addEventListener("dragend", onDragEnd);
    return () => {
      surface.removeEventListener("drop", onDropCapture, true);
      window.removeEventListener("dragend", onDragEnd);
    };
  }, []);

  function collectBlockRects(): Array<{ top: number; height: number }> {
    if (!listRef.current) return [];
    return Array.from(
      listRef.current.querySelectorAll("[data-builder-block-index]"),
    ).map((el) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      return { top: rect.top, height: rect.height };
    });
  }

  function handleDragOver(event: React.DragEvent) {
    if (!isBuilderDrag(event.dataTransfer)) return;
    if (isMergeFieldDrag(event.dataTransfer)) {
      clearDropState();
      event.dataTransfer.dropEffect = "none";
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect =
      event.dataTransfer.effectAllowed === "move" ? "move" : "copy";
    const next = resolveInsertIndex(event.clientY, collectBlockRects());
    dropIndexRef.current = next;
    setDropIndex(next);
  }

  function handleDragOverCapture(event: React.DragEvent) {
    if (!isBuilderDrag(event.dataTransfer)) return;
    if (isMergeFieldDrag(event.dataTransfer)) return;
    const nested = (event.target as Element | null)?.closest?.(
      "[data-builder-nested-drop]",
    );
    if (nested) {
      // Nested targets stopPropagation on bubble — clear the page bar here.
      clearDropVisual();
    }
  }

  function handleDrop(event: React.DragEvent) {
    if (!isBuilderDrag(event.dataTransfer)) return;
    if (isMergeFieldDrag(event.dataTransfer)) {
      clearDropState();
      return;
    }
    event.preventDefault();
    const index = dropIndexRef.current ?? doc.blocks.length;
    clearDropState();
    onDropAt(index, readBuilderDragData(event.dataTransfer));
  }

  const dropHandlers = {
    onDragOverCapture: handleDragOverCapture,
    onDragOver: handleDragOver,
    onDragLeave: (event: React.DragEvent) => {
      if (event.currentTarget.contains(event.relatedTarget as Node)) return;
      clearDropState();
    },
    onDrop: handleDrop,
  };

  const margins = documentContentPaddingStyle(doc);
  const showEmpty = doc.blocks.length === 0 && !doc.header && !doc.footer;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-[#d8d8dc]", className)}>
      <style>{`
        [data-tb-merge], .tb-merge-field {
          display: inline;
          border: 1px solid #0ea5e9;
          background: #e0f2fe;
          color: #0369a1;
          border-radius: 4px;
          padding: 0 0.35em;
          margin: 0 0.1em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.92em;
          line-height: 1.4;
          box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.2);
          white-space: nowrap;
        }
        [data-tb-merge]:hover, .tb-merge-field:hover {
          background: #bae6fd;
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.45);
        }
      `}</style>
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-zinc-300/80 bg-surface-container-high px-3 py-1.5">
        <label className="font-label flex items-center text-[10px] uppercase tracking-widest text-outline">
          Background
          <input
            type="color"
            aria-label="Page background color"
            value={doc.backgroundColor}
            onChange={(event) =>
              onChangeDocument({ backgroundColor: event.target.value })
            }
            className="ml-2 h-7 w-8 cursor-pointer border border-outline-variant/30 bg-transparent"
          />
        </label>
        <div
          ref={setToolbarHost}
          className="min-h-10 min-w-0 flex-1 [&_[role=toolbar]]:border-0 [&_[role=toolbar]]:bg-transparent [&_[role=toolbar]]:px-0 [&_[role=toolbar]]:py-0"
        >
          {!selectedBlockId && !selectedPageBand && (
            <p className="px-1 py-2 text-xs text-on-surface-variant">
              Select a text block to format it
            </p>
          )}
        </div>
      </div>

      <div
        ref={surfaceRef}
        className="min-h-0 flex-1 overflow-y-auto"
        style={{
          ...documentPageBackgroundStyle(doc),
          // Match preview/email outer chrome around the content card.
          padding: 24,
        }}
        onClick={() => {
          onSelectBlock(null);
          onSelectPageBand?.(null);
        }}
        data-testid="template-canvas-drop-surface"
        {...dropHandlers}
      >
        <div className="relative mx-auto w-full max-w-[600px]">
          <div
            className={cn(
              "relative box-border min-h-[640px] w-full overflow-visible text-[#18181b] shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5",
              dropIndex != null && "ring-2 ring-sky-500",
            )}
            style={{
              backgroundColor: doc.contentBackgroundColor || "#ffffff",
              maxWidth: 600,
              ...margins,
            }}
            onClick={(event) => event.stopPropagation()}
            data-testid="template-paper-page"
          >
            {doc.header ? (
              <PageBandEditor
                role="header"
                band={doc.header}
                selected={selectedPageBand === "header"}
                toolbarPortal={
                  selectedPageBand === "header" ? toolbarHost : null
                }
                onSelect={() => {
                  onSelectBlock(null);
                  onSelectPageBand?.("header");
                }}
                onChange={(patch) => onChangePageBand?.("header", patch)}
              />
            ) : null}

            {showEmpty ? (
              <div
                className={cn(
                  "flex min-h-[520px] flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-24 text-center transition-colors",
                  dropIndex != null
                    ? "border-sky-500 bg-sky-50"
                    : "border-zinc-200",
                )}
              >
                <p className="pointer-events-none text-sm text-zinc-400">
                  Drag components anywhere on this page, or click one in the
                  left panel.
                </p>
              </div>
            ) : (
              <div ref={listRef} className="space-y-0">
                {dropIndex === 0 ? <InsertIndicator index={0} /> : null}
                {doc.blocks.map((block, index) => (
                  <div key={block.id}>
                    <div
                      data-builder-block-index={index}
                      data-testid={`builder-block-wrap-${index}`}
                    >
                      <BuilderBlock
                        block={block}
                        selected={selectedBlockId === block.id}
                        toolbarPortal={
                          selectedBlockId === block.id ? toolbarHost : null
                        }
                        onSelect={() => {
                          onSelectPageBand?.(null);
                          onSelectBlock(block.id);
                        }}
                        onChange={(patch) => onChangeBlock(block.id, patch)}
                        onDuplicate={() => onDuplicateBlock(block.id)}
                        onDelete={() => onDeleteBlock(block.id)}
                        onMoveUp={() => onMoveBlock(block.id, "up")}
                        onMoveDown={() => onMoveBlock(block.id, "down")}
                        canMoveUp={index > 0}
                        canMoveDown={index < doc.blocks.length - 1}
                        onDropInColumn={
                          onDropInColumn
                            ? (columnIndex, payload) =>
                                onDropInColumn(block.id, columnIndex, payload)
                            : undefined
                        }
                        onDropInGridCell={
                          onDropInGridCell
                            ? (rowIndex, columnIndex, payload) =>
                                onDropInGridCell(
                                  block.id,
                                  rowIndex,
                                  columnIndex,
                                  payload,
                                )
                            : undefined
                        }
                        selectedColumnItem={
                          selectedBlockId === block.id
                            ? selectedColumnItem
                            : null
                        }
                        onSelectColumnItem={(selection) => {
                          onSelectPageBand?.(null);
                          onSelectColumnItem?.(block.id, selection);
                        }}
                        selectedColumnIndex={
                          selectedBlockId === block.id
                            ? selectedColumnIndex
                            : null
                        }
                        onSelectColumn={(columnIndex) => {
                          onSelectPageBand?.(null);
                          onSelectColumn?.(block.id, columnIndex);
                        }}
                        selectedGridCell={
                          selectedBlockId === block.id
                            ? selectedGridCell
                            : null
                        }
                        onSelectGridCell={(rowIndex, columnIndex) => {
                          onSelectPageBand?.(null);
                          onSelectGridCell?.(block.id, rowIndex, columnIndex);
                        }}
                        selectedImageTextChild={
                          selectedBlockId === block.id
                            ? selectedImageTextChild
                            : null
                        }
                        onSelectImageTextChild={(child) => {
                          onSelectPageBand?.(null);
                          onSelectImageTextChild?.(block.id, child);
                        }}
                      />
                    </div>
                    {index < doc.blocks.length - 1 ? (
                      dropIndex === index + 1 ? (
                        <InsertIndicator index={index + 1} />
                      ) : (
                        <BlockGap />
                      )
                    ) : null}
                  </div>
                ))}
                {dropIndex === doc.blocks.length ? (
                  <InsertIndicator index={doc.blocks.length} />
                ) : null}
              </div>
            )}

            {doc.footer ? (
              <PageBandEditor
                role="footer"
                band={doc.footer}
                selected={selectedPageBand === "footer"}
                toolbarPortal={
                  selectedPageBand === "footer" ? toolbarHost : null
                }
                onSelect={() => {
                  onSelectBlock(null);
                  onSelectPageBand?.("footer");
                }}
                onChange={(patch) => onChangePageBand?.("footer", patch)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
