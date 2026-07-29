"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import {
  BUILDER_COMPONENT_FOLDERS,
  type BuilderComponentFolder,
  type BuilderComponentVariant,
} from "@/lib/email-template-document";
import { parseMergeFieldVariant } from "@/lib/email-content";
import {
  setMergeFieldDragImage,
  setVariantDragData,
} from "@/lib/email-template-dnd";
import { cn } from "@/lib/utils";

export interface BuilderComponentPaletteProps {
  onAdd: (variantId: string) => void;
  disabled?: boolean;
  className?: string;
  /** When true, omit the outer aside frame (used inside BuilderLeftSidebar). */
  embedded?: boolean;
}

function VariantPreview({
  preview,
}: {
  preview: BuilderComponentVariant["preview"];
}): React.ReactElement {
  const cell = "bg-[#c4c4c8]";
  const line = "bg-[#c4c4c8]";
  switch (preview) {
    case "text":
      return (
        <div className="flex h-14 w-full flex-col justify-center gap-1.5 px-2">
          <div className={cn(line, "h-1.5 w-full")} />
          <div className={cn(line, "h-1.5 w-4/5")} />
          <div className={cn(line, "h-1.5 w-3/5")} />
        </div>
      );
    case "heading":
      return (
        <div className="flex h-14 w-full flex-col justify-center gap-1.5 px-2">
          <div className={cn(line, "h-2.5 w-3/4")} />
          <div className={cn(line, "h-1.5 w-full")} />
        </div>
      );
    case "image":
      return (
        <div className="flex h-14 items-center justify-center px-2">
          <div
            className={cn(
              cell,
              "flex h-10 w-full items-center justify-center text-[#8a8a90]",
            )}
          >
            <MaterialIcon name="image" className="text-lg" />
          </div>
        </div>
      );
    case "images2":
      return (
        <div className="flex h-14 items-center justify-center gap-1.5 px-2">
          <div className={cn(cell, "h-10 flex-1")} />
          <div className={cn(cell, "h-10 flex-1")} />
        </div>
      );
    case "spacer":
      return (
        <div className="flex h-14 items-center justify-center px-2">
          <div className="h-6 w-full border border-dashed border-[#b0b0b6]" />
        </div>
      );
    case "button":
      return (
        <div className="flex h-14 items-center justify-center">
          <div className="h-5 w-14 rounded-[2px] bg-sky-500/80" />
        </div>
      );
    case "columns2":
      return (
        <div className="flex h-14 gap-1.5 px-2 py-2">
          <div className={cn(cell, "flex-1")} />
          <div className={cn(cell, "flex-1")} />
        </div>
      );
    case "columns3":
      return (
        <div className="flex h-14 gap-1 px-2 py-2">
          <div className={cn(cell, "flex-1")} />
          <div className={cn(cell, "flex-1")} />
          <div className={cn(cell, "flex-1")} />
        </div>
      );
    case "grid2":
      return (
        <div className="grid h-14 grid-cols-2 gap-1 p-2">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className={cn(cell, "min-h-0")} />
          ))}
        </div>
      );
    case "grid3":
      return (
        <div className="grid h-14 grid-cols-3 gap-0.5 p-2">
          {Array.from({ length: 6 }, (_, key) => (
            <div key={key} className={cn(cell, "min-h-0")} />
          ))}
        </div>
      );
    case "table2":
      return (
        <div className="grid h-14 grid-cols-2 gap-1 p-2">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className={cn(cell, "min-h-0")} />
          ))}
        </div>
      );
    case "table3":
      return (
        <div className="grid h-14 grid-cols-3 gap-0.5 p-2">
          {Array.from({ length: 9 }, (_, key) => (
            <div key={key} className={cn(cell, "min-h-0")} />
          ))}
        </div>
      );
    case "header":
      return (
        <div className="flex h-14 flex-col justify-start gap-1 p-2">
          <div className={cn(cell, "h-4 w-full")} />
          <div className={cn(line, "h-1 w-full opacity-40")} />
          <div className={cn(line, "h-1 w-3/4 opacity-30")} />
        </div>
      );
    case "footer":
      return (
        <div className="flex h-14 flex-col justify-end gap-1 p-2">
          <div className={cn(line, "h-1 w-3/4 opacity-30")} />
          <div className={cn(line, "h-1 w-full opacity-40")} />
          <div className={cn(cell, "h-3 w-full")} />
        </div>
      );
    case "merge":
      return (
        <div className="flex h-14 items-center justify-center px-2">
          <span className="rounded border border-sky-400 bg-sky-50 px-2 py-1 font-mono text-[10px] text-sky-700">
            {"{{…}}"}
          </span>
        </div>
      );
  }
}

function FolderGrid({
  folders,
  disabled,
  onOpen,
}: {
  folders: readonly BuilderComponentFolder[];
  disabled: boolean;
  onOpen: (folder: BuilderComponentFolder) => void;
}): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {folders.map((folder) => (
        <Button
          key={folder.id}
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onOpen(folder)}
          className="flex h-auto flex-col items-center gap-2 rounded-none bg-white px-2 py-4 text-center text-zinc-700 hover:bg-zinc-50"
        >
          <MaterialIcon name={folder.icon} className="text-2xl text-zinc-600" />
          <span className="text-[11px] font-medium text-zinc-600">
            {folder.label}
          </span>
        </Button>
      ))}
    </div>
  );
}

function MergeFieldList({
  folder,
  disabled,
}: {
  folder: BuilderComponentFolder;
  disabled: boolean;
}): React.ReactElement {
  return (
    <div className="space-y-3 p-3">
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {folder.variants.map((variant) => {
          const parsed = parseMergeFieldVariant(variant.id);
          const token = parsed?.token ?? `{{${variant.label}}}`;
          return (
            <li key={variant.id}>
              <button
                type="button"
                disabled={disabled}
                draggable={!disabled}
                data-testid={`merge-palette-${variant.id}`}
                aria-label={`Drag ${variant.label} into text`}
                onDragStart={(event) => {
                  setVariantDragData(event.dataTransfer, variant.id);
                  setMergeFieldDragImage(event.dataTransfer, token);
                }}
                className={cn(
                  "flex w-full cursor-grab items-center gap-2 rounded border border-zinc-200 bg-white px-2.5 py-2 text-left",
                  "hover:border-sky-300 hover:bg-sky-50/40 active:cursor-grabbing",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <span
                  className={cn(
                    "inline-block shrink-0 rounded border border-sky-500 bg-sky-100 px-1.5 py-0.5",
                    "font-mono text-[12px] leading-snug text-sky-800",
                    "shadow-[0_0_0_1px_rgba(14,165,233,0.2)]",
                  )}
                >
                  {token}
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] text-zinc-500">
                  {variant.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {folder.note && (
        <p className="text-xs leading-relaxed text-on-surface-variant">
          Note: {folder.note}
        </p>
      )}
      <p className="text-[11px] text-on-surface-variant">
        Drag a field into a text block (or header/footer). Merge fields cannot
        be placed on the page by themselves.
      </p>
    </div>
  );
}

function VariantGrid({
  folder,
  disabled,
  onAdd,
}: {
  folder: BuilderComponentFolder;
  disabled: boolean;
  onAdd: (variantId: string) => void;
}): React.ReactElement {
  if (folder.id === "merge") {
    return <MergeFieldList folder={folder} disabled={disabled} />;
  }

  if (folder.variants.length === 0) {
    return (
      <div className="space-y-3 p-3">
        <p className="text-xs text-on-surface-variant">
          {folder.note ?? "No layout options in this folder."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <div className="grid grid-cols-2 gap-2">
        {folder.variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            disabled={disabled}
            draggable={!disabled}
            onDragStart={(event) => {
              setVariantDragData(event.dataTransfer, variant.id);
            }}
            onClick={() => onAdd(variant.id)}
            className="flex h-auto cursor-grab flex-col items-stretch gap-2 border border-zinc-300 bg-white px-2 py-2.5 text-left shadow-none transition-colors hover:border-sky-400 hover:bg-zinc-50 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="border border-zinc-200 bg-white">
              <VariantPreview preview={variant.preview} />
            </div>
            <span className="text-center text-[11px] font-medium text-zinc-600">
              {variant.label}
            </span>
          </button>
        ))}
      </div>
      {folder.note && (
        <p className="text-xs leading-relaxed text-on-surface-variant">
          Note: {folder.note}
        </p>
      )}
      <p className="text-[11px] text-on-surface-variant">
        Drag a layout onto the page, or click to add it at the end.
      </p>
    </div>
  );
}

export function BuilderComponentPalette({
  onAdd,
  disabled = false,
  className,
  embedded = false,
}: BuilderComponentPaletteProps): React.ReactElement {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const activeFolder =
    BUILDER_COMPONENT_FOLDERS.find((folder) => folder.id === activeFolderId) ??
    null;

  const body = (
    <>
      <div className="flex items-center gap-1 border-b border-outline-variant/15 px-2 py-2">
        {activeFolder ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Back to components"
              disabled={disabled}
              onClick={() => setActiveFolderId(null)}
              className="text-on-surface-variant"
            >
              <MaterialIcon name="arrow_back" className="text-base" />
            </Button>
            <p className="text-[12px] font-semibold text-on-surface">
              {activeFolder.label}
            </p>
          </>
        ) : (
          <p className="px-2 py-1 text-[12px] font-semibold text-on-surface">
            All components
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeFolder ? (
          <VariantGrid
            folder={activeFolder}
            disabled={disabled}
            onAdd={onAdd}
          />
        ) : (
          <FolderGrid
            folders={BUILDER_COMPONENT_FOLDERS}
            disabled={disabled}
            onOpen={(folder) => setActiveFolderId(folder.id)}
          />
        )}
      </div>

      <p className="mt-auto border-t border-outline-variant/15 px-4 py-3 text-xs text-on-surface-variant">
        Hint: Drag merge fields from the Merge fields folder, or type{" "}
        <code className="font-mono text-white">{"{{lead.first_name}}"}</code>{" "}
        in text.
      </p>
    </>
  );

  if (embedded) {
    return (
      <div
        aria-label="All components"
        className={cn("flex min-h-0 flex-1 flex-col", className)}
      >
        {body}
      </div>
    );
  }

  return (
    <aside
      aria-label="All components"
      className={cn(
        "flex w-full shrink-0 flex-col border-r border-outline-variant/20 bg-surface-container-low md:w-60",
        className,
      )}
    >
      {body}
    </aside>
  );
}
