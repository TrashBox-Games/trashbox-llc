"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLATFORM_BASE, PLATFORM_PATHS, PORTAL_PATHS } from "@/lib/sites";

const platformLinks = [
  { href: PLATFORM_PATHS.hub, label: "Overview", exact: true },
  { href: PLATFORM_PATHS.features, label: "Features" },
  { href: PLATFORM_PATHS.pricing, label: "Pricing" },
  { href: PLATFORM_PATHS.api, label: "API" },
  { href: PLATFORM_PATHS.documentation, label: "Documentation" },
] as const;

function linkClass(active: boolean) {
  return cn(
    "font-headline tracking-tight text-sm uppercase transition-colors",
    active
      ? "border-b-2 border-white pb-1 font-bold text-white"
      : "text-white/60 hover:text-white",
  );
}

function isLinkActive(pathname: string, href: string, exact?: boolean) {
  const normalizedHref = href.replace(/\/$/, "") || "/";
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  if (exact) {
    return (
      normalizedPath === normalizedHref ||
      normalizedPath === PLATFORM_BASE ||
      pathname === PLATFORM_PATHS.hub
    );
  }
  return (
    normalizedPath === normalizedHref ||
    normalizedPath.startsWith(`${normalizedHref}/`)
  );
}

export function PlatformNav() {
  const pathname = usePathname() ?? "";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav
      className="fixed top-0 z-50 w-full"
      aria-label="Trashbox CRM"
    >
      <div
        className={cn(
          "border-b backdrop-blur-xl transition-colors duration-300",
          scrolled
            ? "bg-background/75 border-white/10"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-5 md:px-8 md:py-6">
          <Link
            href={PLATFORM_PATHS.hub}
            className="inline-flex items-center"
            aria-label="Trashbox CRM home"
          >
            <Image
              src="/images/trashbox-logo-white.png"
              alt="Trashbox CRM logo"
              width={160}
              height={40}
              className="h-9 md:h-10"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex lg:gap-10">
            {platformLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={linkClass(
                  isLinkActive(
                    pathname,
                    item.href,
                    "exact" in item ? item.exact : false,
                  ),
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button asChild className="hidden active:scale-95 md:inline-flex">
              <Link href={PORTAL_PATHS.login}>Login</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white md:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <MaterialIcon
                name={open ? "close" : "menu"}
                className="text-[1.5rem]!"
              />
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <div className="bg-background/95 fixed inset-0 top-[73px] z-40 px-6 pt-6 pb-10 md:hidden">
          <div className="flex flex-col gap-6">
            {platformLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={linkClass(
                  isLinkActive(
                    pathname,
                    item.href,
                    "exact" in item ? item.exact : false,
                  ),
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-4">
              <Link href={PORTAL_PATHS.login} onClick={() => setOpen(false)}>
                Login
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
