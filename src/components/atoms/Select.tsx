"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  /** Optional Tailwind class for a colored indicator dot. */
  indicatorClassName?: string;
}

interface SelectProps {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Select({
  id,
  value,
  options,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveIndex(selectedIndex);
    }
  }, [open, selectedIndex]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpen(true);
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(options.length - 1, index + 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) choose(option.value);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        id={id}
        type="button"
        variant="ghost"
        size="default"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => {
          if (!disabled) setOpen((next) => !next);
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "h-auto w-full justify-between gap-2 rounded-none border-0 border-b border-outline-variant bg-transparent py-2 pl-1 font-body text-sm font-normal tracking-normal text-white normal-case hover:bg-transparent hover:text-white focus-visible:border-primary focus-visible:ring-0",
          disabled && "cursor-not-allowed opacity-40",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.indicatorClassName && (
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                selected.indicatorClassName,
              )}
            />
          )}
          <span className="truncate">{selected?.label ?? ""}</span>
        </span>
        <MaterialIcon
          name="expand_more"
          className={cn(
            "text-outline transition-transform",
            open && "rotate-180",
          )}
        />
      </Button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listboxId}-option-${activeIndex}`}
          onKeyDown={onListKeyDown}
          ref={(node) => node?.focus()}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto border border-outline-variant/40 bg-surface-container-high py-1 shadow-lg focus:outline-none"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={`${option.value}-${option.label}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option.value)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 py-2 pl-4 pr-3 text-sm text-on-surface",
                  isActive && "bg-surface-bright text-white",
                  isSelected && "font-medium text-white",
                )}
              >
                {option.indicatorClassName && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      option.indicatorClassName,
                    )}
                  />
                )}
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
