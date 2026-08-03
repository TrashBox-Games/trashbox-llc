"use client";

import { cn } from "@/lib/utils";

export interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  /** Secondary label beside the count (e.g. "this month"). */
  hint?: string;
  ariaLabel: string;
  className?: string;
}

/** Labeled progress bar for a numeric allowance (submissions, seats, etc.). */
export function UsageMeter({
  label,
  used,
  limit,
  hint,
  ariaLabel,
  className,
}: UsageMeterProps) {
  const safeLimit = Math.max(0, limit);
  const safeUsed = Math.max(0, used);
  const pct =
    safeLimit > 0 ? Math.min(100, Math.round((safeUsed / safeLimit) * 100)) : 0;
  const nearLimit = pct >= 90;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="font-label text-outline text-[10px] tracking-widest uppercase">
          {label}
        </p>
        <p className="font-label text-[10px] tracking-widest text-white uppercase">
          {safeUsed.toLocaleString()} / {safeLimit.toLocaleString()}
          {hint ? <span className="text-outline ml-2">{hint}</span> : null}
        </p>
      </div>
      <div
        className="bg-surface-container-highest h-2.5 w-full overflow-hidden rounded-sm"
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={safeLimit}
        aria-valuenow={safeUsed}
      >
        <div
          className={cn(
            "h-full transition-[width] duration-300",
            nearLimit ? "bg-red-400" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
