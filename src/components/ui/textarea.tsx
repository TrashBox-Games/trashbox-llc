import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-none border-0 border-b border-outline-variant bg-transparent px-0 py-4 text-base text-white shadow-none transition-[color,border-color] outline-none placeholder:text-outline-variant/50 focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-error md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
