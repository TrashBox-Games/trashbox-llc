"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "mb-2 block font-label text-[10px] leading-none font-normal tracking-widest text-outline uppercase select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-40 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
