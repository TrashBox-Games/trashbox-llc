"use client";

import {
  useRef,
  useState,
  type JSX,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { LeadInboxCard } from "@/components/features/portal/leads/LeadInboxCard";
import {
  LeadInboxFilters,
  type LeadInboxFiltersValue,
} from "@/components/features/portal/leads/LeadInboxFilters";
import { Button } from "@/components/ui/button";
import {
  leadStatusOf,
  type Submission,
  type TeamMember,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export const INBOX_SIDEBAR_DEFAULT_WIDTH = 320;
export const INBOX_SIDEBAR_MIN_WIDTH = 240;
export const INBOX_SIDEBAR_MAX_WIDTH = 520;
/** Release below this width snaps the leads panel closed. */
export const INBOX_SIDEBAR_COLLAPSE_WIDTH = 180;
export const INBOX_SIDEBAR_SNAP_POINTS = [
  INBOX_SIDEBAR_MIN_WIDTH,
  INBOX_SIDEBAR_DEFAULT_WIDTH,
  INBOX_SIDEBAR_MAX_WIDTH,
] as const;
export const INBOX_SIDEBAR_SNAP_DISTANCE = 32;
const KEYBOARD_RESIZE_STEP = 16;

export function clampInboxSidebarWidth(width: number): number {
  return Math.min(
    INBOX_SIDEBAR_MAX_WIDTH,
    Math.max(INBOX_SIDEBAR_MIN_WIDTH, Math.round(width)),
  );
}

/** Live drag range — allows shrinking past min toward the collapse snap. */
export function clampInboxSidebarDragWidth(width: number): number {
  return Math.min(INBOX_SIDEBAR_MAX_WIDTH, Math.max(0, Math.round(width)));
}

export type InboxSidebarSnapResult =
  | { open: false; width: number }
  | { open: true; width: number };

/** Resolve open/closed + width after a resize drag (or keyboard release). */
export function resolveInboxSidebarSnap(
  rawWidth: number,
): InboxSidebarSnapResult {
  if (rawWidth < INBOX_SIDEBAR_COLLAPSE_WIDTH) {
    return { open: false, width: INBOX_SIDEBAR_DEFAULT_WIDTH };
  }

  let snapped = clampInboxSidebarWidth(rawWidth);
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const point of INBOX_SIDEBAR_SNAP_POINTS) {
    const distance = Math.abs(rawWidth - point);
    if (
      distance <= INBOX_SIDEBAR_SNAP_DISTANCE &&
      distance < nearestDistance
    ) {
      snapped = point;
      nearestDistance = distance;
    }
  }

  return { open: true, width: snapped };
}

export interface LeadInboxSidebarToggleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  tabIndex?: number;
}

/** Compact icon control to show or hide the leads sidebar. */
export function LeadInboxSidebarToggle({
  open,
  onOpenChange,
  className,
  tabIndex,
}: LeadInboxSidebarToggleProps): JSX.Element {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={open ? "Hide leads panel" : "Show leads panel"}
      aria-expanded={open}
      tabIndex={tabIndex}
      className={cn("text-white/60 hover:text-white", className)}
      onClick={() => onOpenChange(!open)}
    >
      <MaterialIcon
        name={open ? "left_panel_close" : "left_panel_open"}
        className="text-xl"
      />
    </Button>
  );
}

export interface LeadInboxResizeHandleProps {
  /** Current sidebar width in px (the split being adjusted). */
  width: number;
  onWidthChange: (width: number) => void;
  /** Called when a drag release snaps the panel closed. */
  onOpenChange?: (open: boolean) => void;
  onDraggingChange?: (dragging: boolean) => void;
  className?: string;
}

/** Drag handle on the email pane’s left edge to resize the leads split. */
export function LeadInboxResizeHandle({
  width,
  onWidthChange,
  onOpenChange,
  onDraggingChange,
  className,
}: LeadInboxResizeHandleProps): JSX.Element {
  const dragRef = useRef<{
    startX: number;
    startWidth: number;
    lastWidth: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  function setDraggingState(next: boolean) {
    setDragging(next);
    onDraggingChange?.(next);
  }

  function applySnap(rawWidth: number) {
    const result = resolveInboxSidebarSnap(rawWidth);
    onWidthChange(result.width);
    if (!result.open) onOpenChange?.(false);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const startWidth = clampInboxSidebarDragWidth(width);
    dragRef.current = {
      startX: event.clientX,
      startWidth,
      lastWidth: startWidth,
    };
    setDraggingState(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const next = clampInboxSidebarDragWidth(
      drag.startWidth + (event.clientX - drag.startX),
    );
    drag.lastWidth = next;
    onWidthChange(next);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const raw = dragRef.current?.lastWidth ?? width;
    dragRef.current = null;
    setDraggingState(false);
    applySnap(raw);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      applySnap(width + KEYBOARD_RESIZE_STEP);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      applySnap(width - KEYBOARD_RESIZE_STEP);
    }
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize email panel"
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={INBOX_SIDEBAR_MAX_WIDTH}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        "absolute top-0 left-0 z-10 flex h-full w-3 -translate-x-1/2 cursor-col-resize touch-none items-stretch justify-center",
        "after:my-auto after:h-12 after:w-px after:bg-outline-variant/40 after:transition-colors",
        "hover:after:bg-white/50 focus-visible:outline-none focus-visible:after:bg-white",
        dragging && "after:bg-white",
        className,
      )}
    />
  );
}

export interface LeadInboxSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: LeadInboxFiltersValue;
  members: TeamMember[];
  onFiltersChange: (value: LeadInboxFiltersValue) => void;
  onApplyFilters: () => void;
  items: Submission[];
  selectedId: string | null;
  onSelect: (submissionId: string) => void;
  listBusy: boolean;
  listError: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  /** Sidebar width in px. */
  width?: number;
  /** Disable width transition while the email-pane handle is dragging. */
  resizing?: boolean;
}

export function LeadInboxSidebar({
  open,
  onOpenChange,
  filters,
  members,
  onFiltersChange,
  onApplyFilters,
  items,
  selectedId,
  onSelect,
  listBusy,
  listError,
  hasMore = false,
  onLoadMore,
  width: widthProp = INBOX_SIDEBAR_DEFAULT_WIDTH,
  resizing = false,
}: LeadInboxSidebarProps): JSX.Element {
  const width = clampInboxSidebarDragWidth(widthProp);

  const showListError =
    listError !== null && listError !== "No Form API account for this email";

  return (
    <div
      data-testid="inbox-sidebar-panel"
      data-state={open ? "open" : "closed"}
      aria-hidden={!open}
      className={cn(
        "relative shrink-0 overflow-hidden",
        !resizing &&
          "transition-[width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{ width: open ? width : 0 }}
    >
      <div style={{ width }} className="pr-1">
        <aside className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              Leads
            </p>
            <LeadInboxSidebarToggle
              open
              onOpenChange={onOpenChange}
              tabIndex={open ? 0 : -1}
            />
          </div>

          <LeadInboxFilters
            value={filters}
            members={members}
            onChange={onFiltersChange}
            onApply={onApplyFilters}
          />

          {showListError && (
            <p className="border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
              {listError}
            </p>
          )}

          {listBusy && items.length === 0 && (
            <p className="font-label text-xs uppercase tracking-widest text-outline">
              Loading…
            </p>
          )}

          {!listBusy && !listError && items.length === 0 && (
            <p className="text-sm text-on-surface-variant">
              No leads match these filters.
            </p>
          )}

          {items.length > 0 && (
            <ul className="flex flex-col gap-2">
              {items.map((item) => {
                const active = item.submissionId === selectedId;
                return (
                  <li key={item.submissionId}>
                    <LeadInboxCard
                      senderName={item.senderName}
                      senderEmail={item.senderEmail}
                      message={item.message}
                      submittedAt={item.submittedAt}
                      status={leadStatusOf(item)}
                      active={active}
                      replyCount={item.messageCount ?? 0}
                      assignedTo={item.assignedTo}
                      onSelect={() => onSelect(item.submissionId)}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {hasMore && onLoadMore && (
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={listBusy}
              tabIndex={open ? 0 : -1}
              onClick={() => onLoadMore()}
            >
              {listBusy ? "Loading…" : "Load more"}
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
