"use client";

import { FadeIn } from "@/components/atoms/FadeIn";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Reveal } from "@/components/atoms/Reveal";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/organisms/ContactForm";
import { useHashScroll } from "@/hooks/use-hash-scroll";

export function ServicesPage() {
  useHashScroll("#contact");

  return (
    <div className="mx-auto max-w-screen-2xl px-8 pt-32 pb-24">
      <header className="mb-32">
        <FadeIn>
          <p className="mb-6 font-label text-xs tracking-[0.4em] text-outline uppercase">
            Capabilities
          </p>
          <h1 className="max-w-4xl font-headline text-6xl leading-tight font-bold tracking-tighter text-white md:text-8xl">
            Engineering <br />
            <span className="text-outline">Digital Sovereignty.</span>
          </h1>
        </FadeIn>
      </header>

      <section className="mb-48 grid grid-cols-1 gap-8 md:grid-cols-12">
        <Reveal
          className="group flex min-h-[500px] flex-col justify-between bg-surface-container-low p-10 transition-all duration-500 hover:bg-surface-container-high md:col-span-7"
          delay={0.02}
        >
          <div>
            <MaterialIcon name="layers" className="mb-8 text-primary" />
            <h2 className="mb-6 font-headline text-4xl font-bold tracking-tight text-white uppercase">
              App Design
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
              We translate complex logic into visceral experiences. Our design philosophy
              prioritizes intentional asymmetry and cinematic interaction models.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            {["UI Architecture", "Experience Systems", "Prototyping"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-outline-variant/20 px-4 py-1 text-[10px] tracking-widest text-outline uppercase"
              >
                {t}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal
          className="flex min-h-[500px] flex-col justify-between bg-surface-container-highest p-10 md:col-span-5"
          delay={0.06}
        >
          <div className="relative mb-8 h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-10" />
            <div className="flex h-full items-center justify-center">
              <MaterialIcon name="terminal" className="text-white/20" />
            </div>
          </div>
          <div>
            <h2 className="mb-4 font-headline text-3xl font-bold tracking-tight text-white uppercase">
              Full-Stack Development
            </h2>
            <p className="text-base leading-relaxed text-on-surface-variant">
              High-performance monoliths and distributed systems built with kinetic precision.
              Scalable, secure, and future-proofed.
            </p>
          </div>
          <div className="mt-8">
            <Button
              type="button"
              variant="ghost"
              className="group gap-2 text-primary"
            >
              Explore Stack
              <MaterialIcon
                name="arrow_forward"
                className="transition-transform group-hover:translate-x-1"
              />
            </Button>
          </div>
        </Reveal>

        <Reveal
          className="flex flex-col items-start gap-12 bg-surface-container-low p-10 md:col-span-12 md:flex-row md:items-center md:p-16"
          delay={0.1}
        >
          <div className="md:w-1/2">
            <MaterialIcon name="psychology" className="mb-8 text-primary" />
            <h2 className="mb-6 font-headline text-5xl font-bold tracking-tight text-white uppercase">
              AI Integration
            </h2>
            <p className="text-xl leading-relaxed text-on-surface-variant">
              Embedding intelligence into the core of your workflow. We specialize in LLM
              orchestration, custom model fine-tuning, and semantic search architectures.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-4 md:w-1/2">
            {[
              { icon: "auto_awesome", label: "LLM Deployments" },
              { icon: "database", label: "Vector Storage" },
              { icon: "neurology", label: "Neural Flows" },
              { icon: "monitoring", label: "Insight Engines" },
            ].map((cell) => (
              <div key={cell.label} className="flex flex-col gap-4 bg-surface-container-high p-6">
                <MaterialIcon name={cell.icon} className="text-primary" />
                <h3 className="font-headline text-sm font-bold text-white uppercase">
                  {cell.label}
                </h3>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <ContactForm />
    </div>
  );
}
