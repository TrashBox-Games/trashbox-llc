"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLATFORM_BASE, PLATFORM_PATHS, PORTAL_PATHS } from "@/lib/sites";

const platformLinks = [
  { href: PLATFORM_PATHS.features, label: "Features" },
  { href: PLATFORM_PATHS.pricing, label: "Pricing" },
  { href: PLATFORM_PATHS.api, label: "API" },
  { href: PLATFORM_PATHS.documentation, label: "Documentation" },
] as const;

function linkClass(active: boolean) {
  return cn(
    "font-label text-[10px] uppercase tracking-widest transition-colors",
    active ? "text-white" : "text-outline hover:text-white",
  );
}

export function PlatformNav() {
  const pathname = usePathname() ?? "";

  return (
    <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/10 pb-6">
      <nav className="flex flex-wrap gap-6 md:gap-8" aria-label="Platform">
        <Link
          href={PLATFORM_PATHS.hub}
          className={linkClass(
            pathname === PLATFORM_BASE ||
              pathname === `${PLATFORM_BASE}/` ||
              pathname === PLATFORM_PATHS.hub,
          )}
        >
          Overview
        </Link>
        {platformLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(
              pathname.startsWith(item.href.replace(/\/$/, "")),
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Button asChild>
        <Link href={PORTAL_PATHS.login}>Login</Link>
      </Button>
    </div>
  );
}
