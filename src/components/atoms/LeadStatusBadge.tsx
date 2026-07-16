import { LEAD_STATUS_DOT_CLASS, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const label = LEAD_STATUS_LABELS[status];

  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={cn("relative inline-flex items-center pr-5", className)}
    >
      <span className="font-label text-[10px] uppercase tracking-widest text-outline">
        {label}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute -right-0 top-0 size-2 shrink-0 rounded-full",
          LEAD_STATUS_DOT_CLASS[status],
        )}
      />
    </span>
  );
}
