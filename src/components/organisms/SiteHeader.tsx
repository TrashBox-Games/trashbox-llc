"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap-client";

const navItems = [
  { href: "/", label: "Home", exact: true },
  { href: "/apps", label: "Apps" },
  { href: "/services", label: "Services" },
  { href: "/email", label: "Email" },
] as const;

function navLinkClass(active: boolean) {
  return cn(
    "font-headline tracking-tight text-sm uppercase transition-colors",
    active
      ? "border-b-2 border-white pb-1 font-bold text-white"
      : "text-white/60 hover:text-white",
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      if (!navRef.current) return;
      gsap.fromTo(
        navRef.current,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
      );
    },
    { scope: navRef },
  );

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

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav ref={navRef} className="fixed top-0 z-50 w-full">
      <div
        className={cn(
          "border-b backdrop-blur-xl transition-colors duration-300",
          scrolled ? "border-white/10 bg-background/75" : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-5 md:px-8 md:py-6">
          <Link href="/" className="inline-flex items-center" aria-label="Trashbox LLC home">
            <Image
              src="/images/trashbox-logo-white.png"
              alt="Trashbox LLC logo"
              width={160}
              height={40}
              className="h-9 md:h-10"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <div className="hidden items-center gap-10 md:flex md:gap-12">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(isActive(item.href, "exact" in item && item.exact))}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#about"
              className="font-headline text-sm uppercase tracking-tight text-white/60 transition-colors hover:text-white"
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/services#contact"
              className="hidden bg-primary px-5 py-2 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80 active:scale-95 md:inline-block"
            >
              Contact
            </Link>
            <button
              type="button"
              className="font-headline text-xs font-bold uppercase text-white md:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <MaterialIcon
                name={open ? "close" : "menu"}
                className="text-[1.5rem]!"
              />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-[73px] z-40 bg-background/95 px-6 pb-10 pt-6 md:hidden">
          <div className="flex flex-col gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(isActive(item.href, "exact" in item && item.exact))}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#about"
              className="font-headline text-sm uppercase tracking-tight text-white/60"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <Link
              href="/services#contact"
              className="mt-4 bg-primary px-6 py-3 text-center font-headline text-xs font-bold uppercase tracking-widest text-on-primary"
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
