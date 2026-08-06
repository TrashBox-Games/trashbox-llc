"use client";

import Link from "next/link";
import { FadeIn } from "@/components/atoms/FadeIn";
import { Reveal } from "@/components/atoms/Reveal";
import { ContactForm } from "@/components/features/contact/ContactForm";
import { SERVICE_OFFERINGS } from "@/components/features/marketing/service-offerings";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import { SERVICE_PATHS } from "@/lib/sites";

export function ServicesPage() {
  useHashScroll("#contact");

  return (
    <div className="mx-auto max-w-screen-2xl px-8 pt-32 pb-24">
      <header className="mb-24 md:mb-32">
        <FadeIn>
          <p className="mb-6 font-label text-xs tracking-[0.4em] text-outline uppercase">
            Services
          </p>
          <h1 className="max-w-4xl font-headline text-6xl leading-tight font-bold tracking-tighter text-white md:text-8xl">
            Build once.
            <br />
            <span className="text-outline">Or keep building.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
            One-off websites and apps when you need a clear finish line. Ongoing development
            when the product—or the business—keeps moving.
          </p>
        </FadeIn>
      </header>

      <section className="mb-32 space-y-16 md:mb-40">
        {SERVICE_OFFERINGS.map((offering, index) => (
          <Reveal
            key={offering.slug}
            fade
            delay={index * 0.04}
            className="grid grid-cols-1 items-start gap-6 border-t border-outline-variant/10 pt-10 lg:grid-cols-12 lg:gap-12"
          >
            <div className="lg:col-span-4">
              <p className="font-label text-[10px] tracking-[0.3em] text-primary/40 uppercase">
                {offering.eyebrow}
              </p>
              <h2 className="mt-3 font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
                <Link
                  href={SERVICE_PATHS[offering.slug]}
                  className="transition-colors hover:text-outline"
                >
                  {offering.title}
                </Link>
              </h2>
            </div>
            <div className="lg:col-span-8">
              <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
                {offering.intro}
              </p>
              <Link
                href={SERVICE_PATHS[offering.slug]}
                className="mt-6 inline-block font-headline text-xs font-bold tracking-widest text-primary uppercase transition-opacity hover:opacity-80"
              >
                View {offering.title}
              </Link>
            </div>
          </Reveal>
        ))}
      </section>

      <ContactForm />
    </div>
  );
}
