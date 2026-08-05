"use client";

import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Reveal } from "@/components/atoms/Reveal";
import { useHashScroll } from "@/hooks/use-hash-scroll";

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

export function HomeAbout() {
  useHashScroll("#about");

  return (
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
  );
}
