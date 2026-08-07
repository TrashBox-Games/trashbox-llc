import { cn } from "@/lib/utils";

type MenuToggleIconProps = {
  open: boolean;
  className?: string;
};

export function MenuToggleIcon({ open, className }: MenuToggleIconProps) {
  return (
    <span
      data-menu-toggle-icon
      data-open={open ? "true" : "false"}
      aria-hidden="true"
      className={cn("relative block size-6", className)}
    >
      <span
        data-bar
        className={cn(
          "absolute left-1/2 block h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-300 ease-out",
          open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[6px]",
        )}
      />
      <span
        data-bar
        className={cn(
          "absolute top-1/2 left-1/2 block h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-all duration-300 ease-out",
          open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100",
        )}
      />
      <span
        data-bar
        className={cn(
          "absolute left-1/2 block h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-300 ease-out",
          open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-[6px]",
        )}
      />
    </span>
  );
}
