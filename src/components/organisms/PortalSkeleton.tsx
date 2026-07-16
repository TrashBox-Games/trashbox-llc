import { Skeleton } from "@/components/atoms/Skeleton";

type PortalSkeletonProps = {
  variant?: "login" | "inbox" | "api-key" | "membership" | "team";
};

/** Content-only placeholders — titles stay real above these. */
export function PortalSkeleton({ variant = "inbox" }: PortalSkeletonProps) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      {variant === "login" && (
        <div className="mx-auto max-w-xl space-y-8">
          <div className="flex gap-6">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {variant === "inbox" && (
        <>
          <div className="mb-10 space-y-3 border-b border-outline-variant/10 pb-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
            <Skeleton className="min-h-72 w-full lg:col-span-7" />
          </div>
        </>
      )}

      {(variant === "api-key" ||
        variant === "membership" ||
        variant === "team") && (
        <div className="space-y-4 border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 w-36" />
            <Skeleton className="h-11 w-36" />
          </div>
        </div>
      )}
    </div>
  );
}
