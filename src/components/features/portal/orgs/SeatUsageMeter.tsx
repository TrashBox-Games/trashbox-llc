"use client";

import {
  UsageMeter,
  type UsageMeterProps,
} from "@/components/features/portal/orgs/UsageMeter";

export type SeatUsageMeterProps = Pick<
  UsageMeterProps,
  "used" | "limit" | "className"
>;

/** Team seat usage as a labeled progress bar. */
export function SeatUsageMeter({
  used,
  limit,
  className,
}: SeatUsageMeterProps) {
  return (
    <UsageMeter
      label="Seats"
      used={used}
      limit={limit}
      ariaLabel="Team member seats"
      className={className}
    />
  );
}
