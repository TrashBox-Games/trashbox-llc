"use client";

import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import {
  buildHierarchyTree,
  hierarchyExpandedIdsForSelection,
  type HierarchyNode,
} from "@/lib/email-template-hierarchy";
import type { EmailTemplateDocument } from "@/lib/email-template-document";
import {
  selectionsEqual,
  type BuilderSelection,
} from "@/lib/email-template-selection";
import { cn } from "@/lib/utils";

export interface BuilderHierarchyPanelProps {
  document: EmailTemplateDocument;
  selection: BuilderSelection;
  onSelect: (selection: BuilderSelection) => void;
  className?: string;
}

function HierarchyRow({
  node,
  depth,
  selection,
  expandedIds,
  onToggle,
  onSelect,
}: {
  node: HierarchyNode;
  depth: number;
  selection: BuilderSelection;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (selection: BuilderSelection) => void;
}): React.ReactElement {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const expanded = expandedIds.has(node.id);
  const selected = selectionsEqual(node.selection, selection);

  return (
    <li>
      <div
        className={cn(
          "flex h-8 items-center gap-1 pr-2 text-[12px]",
          selected
            ? "bg-sky-100 text-sky-950"
            : "text-on-surface hover:bg-surface-container-high",
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={expanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggle(node.id);
            }}
            className="flex size-5 shrink-0 items-center justify-center rounded text-on-surface-variant hover:bg-black/5"
          >
            <MaterialIcon
              name={expanded ? "expand_more" : "chevron_right"}
              className="text-base"
            />
          </button>
        ) : (
          <span className="size-5 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          data-testid={`hierarchy-node-${node.id}`}
          aria-pressed={selected}
          onClick={() => onSelect(node.selection)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          <MaterialIcon
            name={node.icon}
            className="shrink-0 text-[16px] text-on-surface-variant"
          />
          <span className="truncate font-medium">{node.label}</span>
        </button>
      </div>
      {hasChildren && expanded ? (
        <ul className="m-0 list-none p-0">
          {node.children!.map((child) => (
            <HierarchyRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selection={selection}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function BuilderHierarchyPanel({
  document: doc,
  selection,
  onSelect,
  className,
}: BuilderHierarchyPanelProps): React.ReactElement {
  const tree = useMemo(() => buildHierarchyTree(doc), [doc]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const needed = hierarchyExpandedIdsForSelection(tree, selection);
    if (needed.size === 0) return;
    setExpandedIds((current) => {
      const next = new Set(current);
      let changed = false;
      for (const id of needed) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [tree, selection]);

  function toggle(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      aria-label="Hierarchy"
    >
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {tree.length === 0 ? (
          <p className="px-4 py-6 text-xs leading-relaxed text-on-surface-variant">
            Add components to the page to see them in the hierarchy.
          </p>
        ) : (
          <ul className="m-0 list-none p-0">
            {tree.map((node) => (
              <HierarchyRow
                key={node.id}
                node={node}
                depth={0}
                selection={selection}
                expandedIds={expandedIds}
                onToggle={toggle}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </div>
      <p className="mt-auto border-t border-outline-variant/15 px-4 py-3 text-xs text-on-surface-variant">
        Select a parent or child layer to edit its settings.
      </p>
    </div>
  );
}
