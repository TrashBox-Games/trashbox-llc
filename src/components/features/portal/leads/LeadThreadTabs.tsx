"use client";

import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { cn } from "@/lib/utils";

export interface LeadThreadTab {
  id: string;
  label: string;
}

export interface LeadThreadTabsProps {
  tabs: LeadThreadTab[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  className?: string;
}

export function LeadThreadTabs({
  tabs,
  activeId,
  onSelect,
  onClose,
  className,
}: LeadThreadTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <div
      role="tablist"
      aria-label="Open lead threads"
      className={cn("flex gap-1 overflow-x-auto scrollbar-none pr-2", className)}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <div
            key={tab.id}
            className={cn(
              "group relative flex min-w-0 max-w-[12rem] shrink-0 items-stretch rounded-t-md",
              active
                ? "bg-surface-container-low z-10"
                : "bg-surface-container-highest/60 hover:bg-surface-container-high translate-y-1",
            )}
          >
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(tab.id)}
              className={cn(
                "font-label truncate px-3 py-2 pr-7 text-left text-[10px] tracking-widest uppercase transition-colors",
                active
                  ? "text-white"
                  : "text-outline hover:text-white",
              )}
              title={tab.label}
            >
              {tab.label}
            </button>
            <button
              type="button"
              aria-label={`Close ${tab.label}`}
              onClick={(event) => {
                event.stopPropagation();
                onClose(tab.id);
              }}
              className={cn(
                "text-outline absolute top-1/2 right-1 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm transition-colors hover:text-white",
                active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            >
              <MaterialIcon name="close" className="text-sm" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
