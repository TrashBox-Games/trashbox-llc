"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface BlockResizeHandlesProps {
  width: number | null;
  height: number | null;
  /** Measured size when width/height are auto — used as drag start baseline. */
  measure: () => { width: number; height: number };
  onChange: (size: { width?: number | null; height?: number | null }) => void;
  minHeight?: number;
  maxHeight?: number;
  minWidth?: number;
  maxWidth?: number;
}

/**
 * Bottom + right edge handles for resizing a selected builder block.
 * Shows a live px badge while dragging.
 */
export function BlockResizeHandles({
  width,
  height,
  measure,
  onChange,
  minHeight = 24,
  maxHeight = 1200,
  minWidth = 40,
  maxWidth = 600,
}: BlockResizeHandlesProps): React.ReactElement {
  const [badge, setBadge] = useState<string | null>(null);
  const dragRef = useRef<{
    axis: "height" | "width";
    startPointer: number;
    startValue: number;
  } | null>(null);

  function applyMove(clientX: number, clientY: number) {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.axis === "height") {
      const next = Math.min(
        maxHeight,
        Math.max(
          minHeight,
          Math.round(drag.startValue + (clientY - drag.startPointer)),
        ),
      );
      setBadge(`${next}px`);
      onChange({ height: next });
      return;
    }
    const next = Math.min(
      maxWidth,
      Math.max(
        minWidth,
        Math.round(drag.startValue + (clientX - drag.startPointer)),
      ),
    );
    setBadge(`${next}px`);
    onChange({ width: next });
  }

  function endDrag() {
    dragRef.current = null;
    setBadge(null);
  }

  function startHeight(event: React.PointerEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const measured = measure();
    const startValue = height ?? Math.max(minHeight, Math.round(measured.height));
    dragRef.current = {
      axis: "height",
      startPointer: event.clientY,
      startValue,
    };
    setBadge(`${startValue}px`);
  }

  function startWidth(event: React.PointerEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const measured = measure();
    const startValue = width ?? Math.max(minWidth, Math.round(measured.width));
    dragRef.current = {
      axis: "width",
      startPointer: event.clientX,
      startValue,
    };
    setBadge(`${startValue}px`);
  }

  return (
    <>
      <div
        role="slider"
        aria-label="Resize height"
        aria-valuemin={minHeight}
        aria-valuemax={maxHeight}
        aria-valuenow={height ?? minHeight}
        tabIndex={0}
        onPointerDown={startHeight}
        onPointerMove={(event) => applyMove(event.clientX, event.clientY)}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="absolute right-3 bottom-0 left-3 z-30 flex h-3 cursor-ns-resize items-end justify-center"
      >
        <span className="mb-0.5 h-1 w-10 rounded-full bg-sky-500 shadow-[0_0_0_2px_rgba(14,165,233,0.25)]" />
      </div>
      <div
        role="slider"
        aria-label="Resize width"
        aria-valuemin={minWidth}
        aria-valuemax={maxWidth}
        aria-valuenow={width ?? minWidth}
        tabIndex={0}
        onPointerDown={startWidth}
        onPointerMove={(event) => applyMove(event.clientX, event.clientY)}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="absolute top-3 right-0 bottom-3 z-30 flex w-3 cursor-ew-resize items-center justify-end"
      >
        <span className="mr-0.5 h-10 w-1 rounded-full bg-sky-500 shadow-[0_0_0_2px_rgba(14,165,233,0.25)]" />
      </div>
      {badge ? (
        <div
          data-testid="builder-resize-badge"
          className={cn(
            "pointer-events-none absolute bottom-4 left-1/2 z-40 -translate-x-1/2 rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white shadow",
          )}
        >
          {badge}
        </div>
      ) : null}
    </>
  );
}
