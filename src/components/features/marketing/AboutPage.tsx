import Image from "next/image";
import { FadeIn } from "@/components/atoms/FadeIn";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Reveal } from "@/components/atoms/Reveal";
import { TiltMedia } from "@/components/atoms/TiltMedia";
import { ReadyWhenYouAre } from "@/components/features/marketing/ReadyWhenYouAre";

const focusAreas = [
  {
    icon: "smartphone",
    title: "Mobile",
    body: "Apps that feel natural on the phone and hold up in everyday use.",
  },
  {
    icon: "language",
    title: "Web",
    body: "Websites and online tools that look sharp and stay quick as you grow.",
  },
  {
    icon: "hub",
    title: "Full Systems",
    body: "Complete builds that cover everything—from what you see to what runs behind the scenes.",
  },
] as const;

export function AboutPage() {
  return (
    <>
      <div className="mx-auto max-w-screen-2xl px-8 pt-32 pb-24">
        <header className="mb-32">
          <FadeIn>
            <p className="mb-6 font-label text-xs tracking-[0.4em] text-outline uppercase">
              Est. 2025 · Kingwood, TX
            </p>
            <h1 className="max-w-4xl font-headline text-6xl leading-[0.9] font-bold tracking-tighter text-white md:text-8xl">
              Trashbox
            </h1>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed font-light text-on-surface-variant md:text-xl">
              We believe excellence is deserved for businesses of all sizes, small or large. All
              businesses deserve access to affordable, professional software and web services.
            </p>
          </FadeIn>
        </header>

        <section className="mb-48 grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          <Reveal fade className="lg:col-span-5 lg:sticky lg:top-32">
            <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
              Mission
            </span>
            <h2 className="mb-8 font-headline text-4xl font-bold tracking-tight text-white md:text-5xl">
              Promote the work.
              <br />
              <span className="text-outline-variant">Raise the bar.</span>
            </h2>
          </Reveal>

          <Reveal fade className="space-y-8 lg:col-span-7" delay={0.06}>
            <p className="text-xl leading-relaxed text-on-surface-variant">
              Trashbox helps businesses of every size show up online with software that feels
              intentional—fast, clear, and built to grow with them. Whether you need a polished
              product, a sharper marketing site, or the systems behind the scenes, the standard
              stays the same.
            </p>
            <p className="text-lg leading-relaxed text-on-surface-variant">
              Size doesn&apos;t decide quality here. Ambition does. We take small teams as seriously
              as large ones, and we ship work that respects both the people using it and the people
              running the business.
            </p>
          </Reveal>
        </section>

        <section className="mb-24 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-20">
          <Reveal fade className="lg:col-span-5 lg:sticky lg:top-32">
            <TiltMedia className="relative aspect-[4/5]">
              <Image
                src="/images/founder.png"
                alt="Ezekiel Mohr"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </TiltMedia>
          </Reveal>

          <Reveal fade className="lg:col-span-7" delay={0.06}>
            <TiltMedia framed={false}>
              <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
                Founder
              </span>
              <h2 className="mb-8 font-headline text-4xl font-bold tracking-tight text-white md:text-6xl">
                Ezekiel Mohr
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-on-surface-variant">
                Founded in Kingwood, Texas in 2025 by Ezekiel Mohr—a software developer with about four
                years of experience building websites, mobile apps, and the systems behind them.
              </p>
              <p className="mb-6 text-lg leading-relaxed text-on-surface-variant">
                As a senior web developer, he worked on projects under contracts connected to Amazon
                Leo, Amazon&apos;s satellite internet program. That kind of work called for careful,
                dependable engineering when getting it right really mattered.
              </p>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                Along the way he&apos;s shipped mobile apps, dabbled in some game development, and
                built products from the ground up. Trashbox puts that mix of experience toward one
                goal: helping more businesses get software and websites that actually lives up to
                their name.
              </p>
            </TiltMedia>
          </Reveal>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {focusAreas.map((area, idx) => (
            <Reveal fade key={area.title} delay={idx * 0.06}>
              <div className="h-full border-l-2 border-outline-variant bg-surface-container-low p-8">
                <MaterialIcon name={area.icon} className="mb-5 text-primary" />
                <h3 className="mb-3 font-headline text-xl font-bold tracking-tight text-white uppercase">
                  {area.title}
                </h3>
                <p className="leading-relaxed text-on-surface-variant">{area.body}</p>
              </div>
            </Reveal>
          ))}
        </section>
      </div>

      <ReadyWhenYouAre />
    </>
  );
}
