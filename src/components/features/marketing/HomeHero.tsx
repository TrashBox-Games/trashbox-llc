"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-client";

/** Match Reveal: hide before paint so client navigations don't flash then snap. */
const heroItemStyle = {
  opacity: 0,
  transform: "translateY(28px)",
} as const;

export function HomeHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollLineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!heroRef.current) return;
      const items = heroRef.current.querySelectorAll("[data-hero-item]");
      gsap.fromTo(
        items,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.09,
          delay: 0.12,
          ease: "power3.out",
          immediateRender: true,
        },
      );
    },
    { scope: heroRef },
  );

  useGSAP(
    () => {
      if (!scrollLineRef.current) return;
      gsap.to(scrollLineRef.current, {
        scaleY: 0.6,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "top center",
      });
    },
    { scope: scrollLineRef },
  );

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-8 pt-28 pb-36">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,_#1c1b1b_0%,_#131313_100%)]" />
      <div ref={heroRef} className="relative z-10 mx-auto max-w-screen-xl text-center">
        <h1
          data-hero-item
          style={heroItemStyle}
          className="mb-6 font-headline text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] font-bold tracking-tighter text-white uppercase"
        >
          Trashbox LLC
        </h1>
        <p
          data-hero-item
          style={heroItemStyle}
          className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed font-light text-on-surface-variant md:text-xl"
        >
          Websites, apps, and systems for businesses of every size—built to look sharp, work hard,
          and grow with you.
        </p>
        <div
          data-hero-item
          style={heroItemStyle}
          className="flex flex-col items-center justify-center gap-6 md:flex-row"
        >
          <Link
            href="/services#contact"
            className="kinetic-gradient monolith-shadow px-10 py-5 font-headline text-sm font-bold tracking-widest text-on-primary-container uppercase transition-transform hover:scale-[1.02] active:scale-95"
          >
            Work With Us
          </Link>
          <Link
            href="/about"
            className="border border-outline-variant/30 px-10 py-5 font-headline text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-surface-container-low"
          >
            About Us
          </Link>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4">
        <span className="font-label text-[10px] tracking-widest text-outline uppercase">
          Explore
        </span>
        <div
          ref={scrollLineRef}
          className="h-12 w-px bg-gradient-to-b from-primary to-transparent"
        />
      </div>
    </section>
  );
}
