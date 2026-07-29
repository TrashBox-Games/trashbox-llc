"use client";

import { useState } from "react";
import { BuilderComponentPalette } from "@/components/features/portal/settings/template-builder/BuilderComponentPalette";
import { BuilderHierarchyPanel } from "@/components/features/portal/settings/template-builder/BuilderHierarchyPanel";
import type { EmailTemplateDocument } from "@/lib/email-template-document";
import type { BuilderSelection } from "@/lib/email-template-selection";
import { cn } from "@/lib/utils";

export type BuilderLeftSidebarTab = "components" | "hierarchy";

export interface BuilderLeftSidebarProps {
  document: EmailTemplateDocument;
  selection: BuilderSelection;
  onSelect: (selection: BuilderSelection) => void;
  onAdd: (variantId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function BuilderLeftSidebar({
  document: doc,
  selection,
  onSelect,
  onAdd,
  disabled = false,
  className,
}: BuilderLeftSidebarProps): React.ReactElement {
  const [tab, setTab] = useState<BuilderLeftSidebarTab>("components");

  return (
    <aside
      aria-label="Builder sidebar"
      className={cn(
        "flex w-full shrink-0 flex-col border-r border-outline-variant/20 bg-surface-container-low md:w-60",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label="Sidebar view"
        className="grid shrink-0 grid-cols-2 gap-1 border-b border-outline-variant/15 p-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "components"}
          data-testid="builder-sidebar-tab-components"
          disabled={disabled}
          onClick={() => setTab("components")}
          className={cn(
            "rounded px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide",
            tab === "components"
              ? "bg-surface-container-highest text-on-surface"
              : "text-on-surface-variant hover:bg-surface-container-high",
          )}
        >
          Components
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "hierarchy"}
          data-testid="builder-sidebar-tab-hierarchy"
          disabled={disabled}
          onClick={() => setTab("hierarchy")}
          className={cn(
            "rounded px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide",
            tab === "hierarchy"
              ? "bg-surface-container-highest text-on-surface"
              : "text-on-surface-variant hover:bg-surface-container-high",
          )}
        >
          Hierarchy
        </button>
      </div>

      {tab === "components" ? (
        <BuilderComponentPalette
          onAdd={onAdd}
          disabled={disabled}
          embedded
          className="min-h-0 flex-1 border-0"
        />
      ) : (
        <BuilderHierarchyPanel
          document={doc}
          selection={selection}
          onSelect={onSelect}
        />
      )}
    </aside>
  );
}
