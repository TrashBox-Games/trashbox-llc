"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap-client";

const serviceItems = [
  { href: "/services", label: "App Design" },
  { href: "/services", label: "Development" },
  { href: "/services", label: "AI Integration" },
  { href: "/platform", label: "Customer Relationship Management" },
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
  const pathname = usePathname() ?? "";
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

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

  useEffect(() => {
    if (!open) setServicesOpen(false);
  }, [open]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const servicesActive = pathname.startsWith("/services");

  return (
    <nav ref={navRef} className="fixed top-0 z-50 w-full">
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
            href="/"
            className="inline-flex items-center"
            aria-label="Trashbox LLC home"
          >
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
            <Link href="/" className={navLinkClass(isActive("/", true))}>
              Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(navLinkClass(servicesActive), "outline-none")}
              >
                Services
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-64 border-white/10 bg-surface-container-low"
              >
                {serviceItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link
                      href={item.href}
                      className="font-headline text-sm uppercase tracking-tight"
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/platform"
              className={navLinkClass(isActive("/platform"))}
            >
              CRM
            </Link>
            <Link href="/about" className={navLinkClass(isActive("/about"))}>
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild className="hidden active:scale-95 md:inline-flex">
              <Link href="/services#contact">Contact</Link>
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
            <Link
              href="/"
              className={navLinkClass(isActive("/", true))}
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className={cn(navLinkClass(servicesActive), "text-left")}
                aria-expanded={servicesOpen}
                onClick={() => setServicesOpen((v) => !v)}
              >
                Services
              </button>
              {servicesOpen && (
                <div className="flex flex-col gap-3 border-l border-white/10 pl-4">
                  {serviceItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="font-headline text-sm uppercase tracking-tight text-white/60 transition-colors hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/platform"
              className={navLinkClass(isActive("/platform"))}
              onClick={() => setOpen(false)}
            >
              CRM
            </Link>
            <Link
              href="/about"
              className={navLinkClass(isActive("/about"))}
              onClick={() => setOpen(false)}
            >
              About
            </Link>

            <Button asChild className="mt-4">
              <Link href="/services#contact" onClick={() => setOpen(false)}>
                Contact
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
