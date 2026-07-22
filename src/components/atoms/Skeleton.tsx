import { Skeleton as UiSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

/** Pulse placeholder for loading states. Thin atom wrapper over shadcn Skeleton. */
export function Skeleton({ className }: SkeletonProps) {
  return <UiSkeleton className={cn(className)} />;
}
