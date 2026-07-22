import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "animate-pulse rounded-sm bg-surface-container-high/80",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
