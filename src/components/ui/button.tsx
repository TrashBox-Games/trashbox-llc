import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary font-headline text-xs font-bold uppercase tracking-widest text-on-primary hover:opacity-80",
        destructive:
          "bg-error-container font-headline text-xs font-bold uppercase tracking-widest text-on-error-container hover:opacity-90",
        outline:
          "border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-high",
        secondary:
          "bg-secondary-container font-headline text-xs font-bold uppercase tracking-widest text-on-secondary-container hover:opacity-90",
        ghost:
          "font-headline text-xs uppercase tracking-widest text-white/60 hover:bg-transparent hover:text-white",
        link: "font-headline text-xs uppercase tracking-widest text-outline underline-offset-4 hover:text-white hover:underline",
      },
      size: {
        default: "h-auto px-5 py-3",
        xs: "h-6 gap-1 px-2 text-[10px]",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-auto px-6 py-4",
        xl: "h-auto w-full px-6 py-6 tracking-[0.3em]",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
