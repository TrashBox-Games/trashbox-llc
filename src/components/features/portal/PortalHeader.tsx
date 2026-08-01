"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Skeleton } from "@/components/atoms/Skeleton";
import { PortalUserMenu } from "@/components/features/portal/PortalUserMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { teamMemberDisplayName } from "@/lib/api";
import { usePortal } from "@/lib/portal";
import { cn } from "@/lib/utils";
import { PORTAL_PATHS } from "@/lib/sites";

const signedInLinks = [
  { href: PORTAL_PATHS.home, label: "Home", icon: "home" },
  { href: PORTAL_PATHS.inbox, label: "Inbox", icon: "inbox" },
  { href: PORTAL_PATHS.settings, label: "Settings", icon: "settings" },
  {
    href: PORTAL_PATHS.membership,
    label: "Membership",
    icon: "workspace_premium",
  },
] as const;

function linkClass(active: boolean) {
  return cn(
    "inline-flex items-center justify-center transition-colors",
    active ? "text-white" : "text-outline hover:text-white",
  );
}

function isPortalNavActive(pathname: string, href: string): boolean {
  const normalizedHref = href.replace(/\/$/, "") || "/";
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  // Home is exactly /portal — don't treat every portal child as active.
  if (normalizedHref === "/portal") {
    return normalizedPath === "/portal";
  }
  return (
    normalizedPath === normalizedHref ||
    normalizedPath.startsWith(`${normalizedHref}/`)
  );
}

const SCROLL_TOP_THRESHOLD = 12;
const SCROLL_DELTA_THRESHOLD = 8;

/** Standalone chrome for /portal — separate from marketing SiteHeader. */
export function PortalHeader() {
  const pathname = usePathname() ?? "";
  const auth = useAuth();
  const portal = usePortal();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > SCROLL_TOP_THRESHOLD);

      if (y <= SCROLL_TOP_THRESHOLD) {
        setHidden(false);
        lastY = y;
        return;
      }

      const delta = y - lastY;
      if (Math.abs(delta) < SCROLL_DELTA_THRESHOLD) return;

      setHidden(delta > 0);
      lastY = y;
    };

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

  const signedIn = auth.status === "signedIn";
  const authLoading = auth.status === "loading";
  const headerHidden = hidden && !open;
  const currentMember = auth.email
    ? portal.members.find(
        (member) => member.email.toLowerCase() === auth.email!.toLowerCase(),
      )
    : undefined;
  const userName = currentMember
    ? teamMemberDisplayName(currentMember)
    : null;

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-transform duration-300 ease-out",
        headerHidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div
        className={cn(
          "border-b backdrop-blur-xl transition-colors duration-300",
          scrolled
            ? "border-white/10 bg-background/90"
            : "border-outline-variant/10 bg-background/80",
        )}
      >
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-6 py-2 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
            aria-label="Trashbox home"
          >
            <Image
              src="/images/trashbox-logo-white.png"
              alt=""
              width={96}
              height={24}
              className="h-5"
              style={{ width: "auto" }}
              priority
            />
            <span className="border-l border-outline-variant/30 pl-2.5 font-headline text-[10px] font-bold uppercase tracking-widest text-white">
              Portal
            </span>
          </Link>

          {(signedIn || authLoading) && (
            <nav
              className="hidden items-center gap-5 md:flex"
              aria-label="Portal"
              aria-busy={authLoading}
            >
              {authLoading
                ? signedInLinks.map((item) => (
                    <Skeleton key={item.href} className="size-5 rounded-md" />
                  ))
                : signedInLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={item.label}
                      className={linkClass(
                        isPortalNavActive(pathname, item.href),
                      )}
                    >
                      <MaterialIcon name={item.icon} className="text-[1.15rem]!" />
                    </Link>
                  ))}
            </nav>
          )}

          <div className="flex min-w-26 items-center justify-end gap-2">
            {authLoading ? (
              <Skeleton className="size-8 rounded-full" />
            ) : signedIn && auth.email ? (
              <PortalUserMenu
                email={auth.email}
                name={userName}
                clientName={portal.clientName}
                onSignOut={() => auth.signOutUser()}
              />
            ) : (
              <Button asChild size="sm">
                <Link href={PORTAL_PATHS.login}>Login</Link>
              </Button>
            )}
            {signedIn && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-white md:hidden"
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
              >
                <MaterialIcon
                  name={open ? "close" : "menu"}
                  className="text-[1.25rem]!"
                />
              </Button>
            )}
          </div>
        </div>
      </div>

      {open && signedIn && (
        <div className="fixed inset-0 top-11 z-40 bg-background/95 px-6 pb-10 pt-6 md:hidden">
          <div className="flex flex-col gap-6">
            {signedInLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={cn(
                  linkClass(isPortalNavActive(pathname, item.href)),
                  "gap-3 font-label text-[10px] uppercase tracking-widest",
                )}
                onClick={() => setOpen(false)}
              >
                <MaterialIcon name={item.icon} className="text-[1.35rem]!" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
