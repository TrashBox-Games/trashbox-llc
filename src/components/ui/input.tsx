import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-auto w-full min-w-0 rounded-none border-0 border-b border-outline-variant bg-transparent px-0 py-4 text-base text-white shadow-none transition-[color,border-color] outline-none placeholder:text-outline-variant/50 focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-40 md:text-sm",
        "aria-invalid:border-error",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
