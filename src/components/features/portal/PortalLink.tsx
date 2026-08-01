"use client";

import type { ComponentProps, MouseEvent } from "react";
import { portalNavigate } from "@/lib/portal-routes";
import { cn } from "@/lib/utils";

type PortalLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  /** Use history.replaceState instead of pushState. */
  replace?: boolean;
};

/**
 * Soft-navigates GitHub-style portal workspace URLs without relying on
 * Next.js static pages for arbitrary org/project slugs.
 */
export function PortalLink({
  href,
  replace,
  className,
  onClick,
  children,
  ...rest
}: PortalLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (rest.target === "_blank") return;
    event.preventDefault();
    portalNavigate(href, { replace });
  };

  return (
    <a href={href} className={cn(className)} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
