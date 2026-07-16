"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Reveal } from "@/components/atoms/Reveal";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import { gsap } from "@/lib/gsap-client";

const aboutCards = [
  {
    icon: "terminal",
    title: "Kinetic Codebases",
    body: "Lightweight, performant, and infinitely scalable architectures built with modern tech stacks like Rust, Go, and React.",
    border: "border-primary",
  },
  {
    icon: "auto_awesome",
    title: "Intelligent Motion",
    body: "We utilize motion not as decoration, but as a functional guide for user attention and cognitive flow.",
    border: "border-outline-variant",
  },
  {
    icon: "token",
    title: "Editorial Design",
    body: "Precision typography and intentional white space that turns software into a premium editorial experience.",
    border: "border-outline-variant",
  },
] as const;

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollLineRef = useRef<HTMLDivElement>(null);
  useHashScroll("#about");

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
    <>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-8 pt-28 pb-36">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,_#1c1b1b_0%,_#131313_100%)]" />
        <div ref={heroRef} className="relative z-10 mx-auto max-w-screen-xl text-center">
          <h1
            data-hero-item
            className="mb-6 font-headline text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] font-bold tracking-tighter text-white uppercase"
          >
            Trashbox LLC
          </h1>
          <p
            data-hero-item
            className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed font-light text-on-surface-variant md:text-xl"
          >
            Architecting the next generation of digital tools through high-fidelity engineering and
            editorial design systems.
          </p>
          <div
            data-hero-item
            className="flex flex-col items-center justify-center gap-6 md:flex-row"
          >
            <Link
              href="/services#contact"
              className="kinetic-gradient monolith-shadow px-10 py-5 font-headline text-sm font-bold tracking-widest text-on-primary-container uppercase transition-transform hover:scale-[1.02] active:scale-95"
            >
              Work With Us
            </Link>
            <Link
              href="/apps"
              className="border border-outline-variant/30 px-10 py-5 font-headline text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-surface-container-low"
            >
              View Projects
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

      <section className="bg-surface-container-low px-8 py-32">
        <div className="mx-auto max-w-screen-2xl">
          <Reveal fade className="mb-24 flex flex-col items-end justify-between gap-8 md:flex-row">
            <div className="max-w-xl">
              <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
                Portfolio
              </span>
              <h2 className="font-headline text-5xl font-bold tracking-tight text-white md:text-7xl">
                Selected Outputs.
              </h2>
            </div>
            <div className="border-b border-outline-variant pb-2 font-label text-sm tracking-widest text-on-surface-variant uppercase">
              01 — 04
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <Reveal fade className="group cursor-pointer md:col-span-8" delay={0.05}>
              <div className="relative aspect-[16/9] overflow-hidden bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGTsxT2KTQ0bRh1-PpZdtr0C7oXE1Bdem-I6hiCgp61RP6dbj-2oLX2Yn021NqyNsH2l7MJnhZB4W4pgY6i4XFZ5UjU1v90THd7RDG6Gos19YkRNPbzRAK1TpPwqnF2UsCAeecAV0ljNeXZKF-9gWfxsch7EuVx7D-THPiZOUt9Rl38fSkfsLbz_MHjhkEpj-oQz4xFr8JJJ-rDQpy66h-QWycLtyxzcdA5iSPCdYtK1aqZpnApT4sNklKPe8jc9ItY1dgfQaybCw"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-12">
                  <div className="mb-4 flex items-center gap-4">
                    <span className="bg-white px-3 py-1 text-[10px] font-bold tracking-widest text-black uppercase">
                      Fintech
                    </span>
                    <span className="font-label text-[10px] tracking-widest text-white/40 uppercase">
                      2024
                    </span>
                  </div>
                  <h3 className="mb-4 font-headline text-4xl font-bold text-white md:text-5xl">
                    Aura Capital
                  </h3>
                  <p className="max-w-md text-white/60">
                    The world&apos;s first AI-driven wealth management interface for the kinetic
                    monolith.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal fade className="group cursor-pointer md:col-span-4" delay={0.1}>
              <div className="relative h-full overflow-hidden bg-surface-container-highest md:aspect-auto md:h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  className="h-full min-h-[280px] w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105 md:aspect-square"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2VpWbGD_AuHhU7nWuqdXz3lK5xLABLtdf7wzrkjAgP_ojXvZW8bIyA4tHAYZOtHSRNwI1LEW_i1V45NZM4-sUYmfjS6O6rcQ_DCGgO6Sc-BNoznDoTfqAgE-bgtFOBFQM6m5EpNLsvl6gTEa7ZWTPuUjxP6A1x8LJGuo622CTqHRpNXJ9A01OO-sfHOaXp2-jPrumBZM6N-qFyEXoCqUhZNq1nUMQOOnhRNsJAo39sHFePgZwfdG7aQza3PJuXA71frZBa2dUYOE"
                />
                <div className="absolute inset-0 flex flex-col justify-between p-8">
                  <MaterialIcon name="arrow_outward" className="self-end text-white" />
                  <div>
                    <span className="mb-2 block font-label text-[10px] tracking-widest text-primary/40 uppercase">
                      Web3
                    </span>
                    <h3 className="font-headline text-2xl font-bold text-white">Prism Node</h3>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal fade className="group cursor-pointer md:col-span-4" delay={0.05}>
              <div className="relative aspect-square overflow-hidden bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  className="h-full w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8KuTXifQLkGMwyxwchwXbVaeqD-kvOJ5gRUiQ_qoy8DV_HuXzVuaSWPXxScxADMe2vDAA9S8NKF_lF9ASSf_lRBDZYAoebY7FHbc4xPiMJ45jIvur-iFDQ1SmpDwmtdRjBQ8b-C3KG0zg9BXovmARPX8FLXTVu7DwDUDT1T9l55uM6UskCPKWfUebpQiJHNbYhqu0vLAzEtTVGRKKnSkqr6_ThVslNKylbbGizbS2MMwRLE8TGIP3-liwL6gnjpAnuSrDFmNgtPE"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <h3 className="mb-2 font-headline text-2xl font-bold text-white">Ghost OS</h3>
                  <p className="text-sm text-white/40">Experimental spatial operating system.</p>
                </div>
              </div>
            </Reveal>

            <Reveal fade className="group cursor-pointer md:col-span-8" delay={0.1}>
              <div className="relative aspect-[21/9] overflow-hidden bg-surface-container-high">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSCI4O9qpABcQQI2Cwbess7KBaIAhFgRBp5ihcLyz7nT3Oft6QrjRFfGxL328LBqvUM7yUu2w6FczMsl9oMiMGrXWPqrCGigjsyUBzrcz2s5SUFjt6zf6bk7vm2VCM_ipaVD52v8heKLb-OZfg-SahldXScn_BWQFY-jkH2KIJ0uw1SOiKwb0g5kMD4dqTSde2BM-VfnrLKrYbHfFWvyjI931WZWWytwcWPVgPMda5u7--hPFe0tFfgHQJ48MY6-mqiQrhqfSD4_s"
                />
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/80 to-transparent p-12">
                  <span className="mb-2 font-label text-[10px] tracking-widest text-primary/40 uppercase">
                    SaaS
                  </span>
                  <h3 className="font-headline text-4xl font-bold text-white">
                    Monolith Analytics
                  </h3>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="about" className="px-8 py-32">
        <div className="mx-auto max-w-screen-xl">
          <div className="grid grid-cols-1 items-start gap-24 lg:grid-cols-2">
            <Reveal fade className="lg:sticky lg:top-32">
              <h2 className="mb-8 font-headline text-5xl font-bold tracking-tight text-white md:text-7xl">
                Engineering
                <br />
                <span className="text-outline-variant">Elegance.</span>
              </h2>
              <p className="mb-12 text-xl leading-relaxed text-on-surface-variant">
                We don&apos;t just build apps. We construct digital environments that respect the
                user&apos;s intelligence and the machine&apos;s precision.
              </p>
              <div className="space-y-6">
                {["Product Strategy", "UI/UX Systems", "AI Integration"].map((label, i) => (
                  <Reveal fade key={label} delay={i * 0.08}>
                    <div className="flex items-center gap-4 text-white">
                      <span className="font-label text-[10px] text-outline">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-headline text-sm font-bold tracking-widest uppercase">
                        {label}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>

            <div className="space-y-16">
              {aboutCards.map((card, idx) => (
                <Reveal fade key={card.title} delay={idx * 0.06}>
                  <div className={`border-l-2 ${card.border} bg-surface-container-low p-12`}>
                    <MaterialIcon name={card.icon} className="mb-6 text-primary" />
                    <h4 className="mb-4 font-headline text-2xl font-bold tracking-tight text-white uppercase">
                      {card.title}
                    </h4>
                    <p className="leading-relaxed text-on-surface-variant">{card.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest px-8 py-48 text-center">
        <Reveal fade className="mx-auto max-w-4xl">
          <h2 className="mb-12 font-headline text-6xl font-bold tracking-tighter text-white md:text-8xl">
            Let&apos;s build
            <br />
            the future.
          </h2>
          <div className="flex flex-col items-center gap-8">
            <Link
              href="/services#contact"
              className="kinetic-gradient monolith-shadow px-12 py-6 font-headline text-base font-bold tracking-widest text-on-primary-container uppercase transition-transform hover:scale-[1.05]"
            >
              Start Your Project
            </Link>
            <a
              className="font-label text-xs tracking-[0.4em] text-white/40 uppercase transition-colors hover:text-white"
              href="mailto:contact@trashbox.io"
            >
              contact@trashbox.io
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
