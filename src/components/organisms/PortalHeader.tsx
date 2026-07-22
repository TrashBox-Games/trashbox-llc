"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { PLATFORM_PATHS, PORTAL_PATHS } from "@/lib/sites";

const signedInLinks = [
  { href: PORTAL_PATHS.inbox, label: "Inbox" },
  { href: PORTAL_PATHS.settings, label: "Settings" },
  { href: PORTAL_PATHS.membership, label: "Membership" },
] as const;

function linkClass(active: boolean) {
  return cn(
    "font-label text-[10px] uppercase tracking-widest transition-colors",
    active ? "text-white" : "text-outline hover:text-white",
  );
}

/** Standalone chrome for /portal — separate from marketing SiteHeader. */
export function PortalHeader() {
  const pathname = usePathname();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const signedIn = auth.status === "signedIn";
  const authLoading = auth.status === "loading";

  return (
    <header className="fixed top-0 z-50 w-full">
      <div
        className={cn(
          "border-b backdrop-blur-xl transition-colors duration-300",
          scrolled
            ? "border-white/10 bg-background/90"
            : "border-outline-variant/10 bg-background/80",
        )}
      >
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-8 py-5 md:py-6">
          <Link
            href={signedIn ? PORTAL_PATHS.inbox : PORTAL_PATHS.login}
            className="inline-flex items-center gap-3"
            aria-label="Trashbox Portal home"
          >
            <Image
              src="/images/trashbox-logo-white.png"
              alt=""
              width={120}
              height={30}
              className="h-7"
              style={{ width: "auto" }}
              priority
            />
            <span className="border-l border-outline-variant/30 pl-3 font-headline text-xs font-bold uppercase tracking-widest text-white">
              Portal
            </span>
          </Link>

          {(signedIn || authLoading) && (
            <nav
              className="hidden items-center gap-7 md:flex"
              aria-label="Portal"
              aria-busy={authLoading}
            >
              {authLoading
                ? signedInLinks.map((item) => (
                    <Skeleton key={item.href} className="h-3 w-14" />
                  ))
                : signedInLinks.map((item) => (
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
          )}

          <div className="flex min-w-[7.5rem] items-center justify-end gap-3">
            <Link
              href={PLATFORM_PATHS.hub}
              className="hidden font-label text-[10px] uppercase tracking-widest text-outline transition-colors hover:text-white lg:inline"
            >
              Platform
            </Link>
            {authLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : signedIn ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void auth.signOutUser()}
              >
                Sign out
              </Button>
            ) : (
              <Button asChild>
                <Link href={PORTAL_PATHS.login}>Login</Link>
              </Button>
            )}
            {signedIn && (
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
            )}
          </div>
        </div>
      </div>

      {open && signedIn && (
        <div className="fixed inset-0 top-[65px] z-40 bg-background/95 px-6 pb-10 pt-6 md:hidden">
          <div className="flex flex-col gap-6">
            {signedInLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(
                  pathname.startsWith(item.href.replace(/\/$/, "")),
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={PLATFORM_PATHS.hub}
              className="font-label text-[10px] uppercase tracking-widest text-outline"
              onClick={() => setOpen(false)}
            >
              Back to Platform
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
