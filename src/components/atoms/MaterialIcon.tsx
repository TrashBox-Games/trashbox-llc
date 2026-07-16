import { cn } from "@/lib/utils";

type MaterialIconProps = {
  name: string;
  className?: string;
};

export function MaterialIcon({ name, className }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined leading-none", className)}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
