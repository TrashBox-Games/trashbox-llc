import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

/** Pulse placeholder for loading states. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-sm bg-surface-container-high/80",
        className,
      )}
    />
  );
}
