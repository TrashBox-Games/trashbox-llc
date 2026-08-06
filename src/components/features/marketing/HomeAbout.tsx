"use client";

import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Reveal } from "@/components/atoms/Reveal";
import { useHashScroll } from "@/hooks/use-hash-scroll";

const aboutCards = [
  {
    icon: "language",
    title: "Sites that convert",
    body: "Marketing sites and launches that look sharp, load fast, and make it easy for customers to take the next step.",
    border: "border-primary",
  },
  {
    icon: "devices",
    title: "Products people use",
    body: "Web and mobile apps built around real workflows—so your team and customers get value on day one, not after a rewrite.",
    border: "border-outline-variant",
  },
  {
    icon: "hub",
    title: "Systems that keep up",
    body: "The APIs, integrations, and infrastructure behind the product—steady enough to ship once, flexible enough to grow with you.",
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
              Software that
              <br />
              <span className="text-outline-variant">earns its keep.</span>
            </h2>
            <p className="mb-12 text-xl leading-relaxed text-on-surface-variant">
              Trashbox helps businesses show up online with websites, apps, and systems that feel
              intentional—whether you need a finished launch or a partner who keeps shipping with
              you.
            </p>
            <div className="space-y-6">
              {["One-off builds", "Ongoing development", "AI when it helps"].map((label, i) => (
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
