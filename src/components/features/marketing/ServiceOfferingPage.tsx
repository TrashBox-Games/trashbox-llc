import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/atoms/FadeIn";
import { Reveal } from "@/components/atoms/Reveal";
import { TiltMedia } from "@/components/atoms/TiltMedia";
import { ReadyWhenYouAre } from "@/components/features/marketing/ReadyWhenYouAre";
import type { ServiceOffering } from "@/components/features/marketing/service-offerings";
import { cn } from "@/lib/utils";

type ServiceOfferingPageProps = {
  offering: ServiceOffering;
};

function OfferingImage({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <TiltMedia
      className={cn("relative", className)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
      />
    </TiltMedia>
  );
}

function EngagementSections({ offering }: { offering: ServiceOffering }) {
  return (
    <>
      <section className="mt-32 grid grid-cols-1 items-start gap-12 lg:mt-40 lg:grid-cols-12 lg:gap-20">
        <Reveal fade className="lg:col-span-4 lg:sticky lg:top-32">
          <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
            One-off
          </span>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
            {offering.oneOffTitle}
          </h2>
        </Reveal>
        <Reveal fade className="space-y-6 lg:col-span-8" delay={0.06}>
          {offering.oneOffBody.map((paragraph) => (
            <p
              key={paragraph}
              className="text-lg leading-relaxed text-on-surface-variant md:text-xl"
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </section>

      <section className="mt-32 grid grid-cols-1 items-start gap-12 lg:mt-40 lg:grid-cols-12 lg:gap-20">
        <Reveal fade className="lg:col-span-4 lg:sticky lg:top-32">
          <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
            Ongoing
          </span>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
            {offering.ongoingTitle}
          </h2>
        </Reveal>
        <Reveal fade className="space-y-6 lg:col-span-8" delay={0.06}>
          {offering.ongoingBody.map((paragraph) => (
            <p
              key={paragraph}
              className="text-lg leading-relaxed text-on-surface-variant md:text-xl"
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </section>
    </>
  );
}

function HighlightsRail({ offering }: { offering: ServiceOffering }) {
  return (
    <section className="mt-24 grid grid-cols-1 gap-10 md:mt-32 md:grid-cols-3 md:gap-8">
      {offering.highlights.map((item, index) => (
        <Reveal fade key={item.label} delay={index * 0.05}>
          <div className="border-l-2 border-outline-variant pl-6">
            <h3 className="font-headline text-lg font-bold tracking-tight text-white">
              {item.label}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {item.body}
            </p>
          </div>
        </Reveal>
      ))}
    </section>
  );
}

function ShowcaseLayout({ offering }: { offering: ServiceOffering }) {
  return (
    <>
      <header className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-16">
        <FadeIn className="lg:col-span-6">
          <p className="mb-6 font-label text-xs tracking-[0.4em] text-outline uppercase">
            {offering.eyebrow}
          </p>
          <h1 className="font-headline text-5xl font-bold leading-tight tracking-tighter text-white md:text-7xl">
            {offering.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant">
            {offering.intro}
          </p>
        </FadeIn>
        <Reveal fade className="lg:col-span-6" delay={0.08}>
          <OfferingImage
            src={offering.image.src}
            alt={offering.image.alt}
            className="aspect-[16/10]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </Reveal>
      </header>

      <EngagementSections offering={offering} />

      <Reveal fade className="mt-32 lg:mt-40">
        <OfferingImage
          src={offering.image.src}
          alt=""
          className="aspect-[21/9] md:aspect-[24/9] [&_img]:opacity-80"
          sizes="100vw"
        />
      </Reveal>

      <HighlightsRail offering={offering} />
    </>
  );
}

function ProductLayout({ offering }: { offering: ServiceOffering }) {
  return (
    <>
      <FadeIn>
        <p className="mb-6 font-label text-xs tracking-[0.4em] text-outline uppercase">
          {offering.eyebrow}
        </p>
        <h1 className="max-w-4xl font-headline text-5xl font-bold leading-tight tracking-tighter text-white md:text-7xl">
          {offering.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          {offering.intro}
        </p>
      </FadeIn>

      {offering.process ? (
        <section className="mt-24 space-y-12 border-t border-outline-variant/10 pt-16 md:mt-32">
          <Reveal fade>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-white md:text-3xl">
              How a build usually moves
            </h2>
          </Reveal>
          <ol className="space-y-12">
            {offering.process.map((step, index) => (
              <Reveal fade key={step.title} delay={index * 0.05}>
                <li className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-10">
                  <p className="font-label text-[10px] tracking-[0.35em] text-primary/50 uppercase md:col-span-2">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="md:col-span-10">
                    <h3 className="font-headline text-xl font-bold text-white md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-lg">
                      {step.body}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mt-32 grid grid-cols-1 items-center gap-12 lg:mt-40 lg:grid-cols-12 lg:gap-16">
        <Reveal fade className="lg:col-span-7">
          <OfferingImage
            src={offering.image.src}
            alt={offering.image.alt}
            className="aspect-[16/10]"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </Reveal>
        <Reveal fade className="space-y-6 lg:col-span-5" delay={0.06}>
          <span className="block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
            One-off
          </span>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-white">
            {offering.oneOffTitle}
          </h2>
          {offering.oneOffBody.map((paragraph) => (
            <p
              key={paragraph}
              className="text-base leading-relaxed text-on-surface-variant md:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </section>

      <section className="mt-32 grid grid-cols-1 items-start gap-12 lg:mt-40 lg:grid-cols-12 lg:gap-20">
        <Reveal fade className="lg:col-span-4 lg:sticky lg:top-32">
          <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
            Ongoing
          </span>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
            {offering.ongoingTitle}
          </h2>
        </Reveal>
        <Reveal fade className="space-y-6 lg:col-span-8" delay={0.06}>
          {offering.ongoingBody.map((paragraph) => (
            <p
              key={paragraph}
              className="text-lg leading-relaxed text-on-surface-variant md:text-xl"
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </section>

      <HighlightsRail offering={offering} />
    </>
  );
}

function FoundationLayout({ offering }: { offering: ServiceOffering }) {
  return (
    <>
      <FadeIn>
        <p className="mb-6 font-label text-xs tracking-[0.4em] text-outline uppercase">
          {offering.eyebrow}
        </p>
        <h1 className="max-w-4xl font-headline text-5xl font-bold leading-tight tracking-tighter text-white md:text-7xl">
          {offering.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          {offering.intro}
        </p>
      </FadeIn>

      <section className="mt-24 grid grid-cols-1 items-start gap-12 lg:mt-32 lg:grid-cols-12 lg:gap-16">
        <Reveal fade className="lg:col-span-5 lg:sticky lg:top-32">
          <OfferingImage
            src={offering.image.src}
            alt={offering.image.alt}
            className="aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 40vw"
            priority
          />
        </Reveal>
        <div className="space-y-20 lg:col-span-7">
          <Reveal fade delay={0.06}>
            <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
              One-off
            </span>
            <h2 className="mb-6 font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
              {offering.oneOffTitle}
            </h2>
            <div className="space-y-5">
              {offering.oneOffBody.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-lg leading-relaxed text-on-surface-variant"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal fade delay={0.08}>
            <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
              Ongoing
            </span>
            <h2 className="mb-6 font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
              {offering.ongoingTitle}
            </h2>
            <div className="space-y-5">
              {offering.ongoingBody.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-lg leading-relaxed text-on-surface-variant"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <HighlightsRail offering={offering} />
    </>
  );
}

function DeviceLayout({ offering }: { offering: ServiceOffering }) {
  return (
    <>
      <header className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <FadeIn className="lg:col-span-7">
          <p className="mb-6 font-label text-xs tracking-[0.4em] text-outline uppercase">
            {offering.eyebrow}
          </p>
          <h1 className="font-headline text-5xl font-bold leading-tight tracking-tighter text-white md:text-7xl">
            {offering.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant">
            {offering.intro}
          </p>
          {offering.portfolioHref ? (
            <Link
              href={offering.portfolioHref}
              className="mt-8 inline-block font-headline text-xs font-bold tracking-widest text-primary uppercase transition-opacity hover:opacity-80"
            >
              See selected mobile work
            </Link>
          ) : null}
        </FadeIn>
        <Reveal fade className="mx-auto w-full max-w-sm lg:col-span-5" delay={0.08}>
          <OfferingImage
            src={offering.image.src}
            alt={offering.image.alt}
            className="aspect-[3/4]"
            sizes="(max-width: 1024px) 80vw, 30vw"
            priority
          />
        </Reveal>
      </header>

      {(offering.fitTitle || offering.fitBody) && (
        <section className="mt-28 border-y border-outline-variant/10 py-16 lg:mt-36 lg:py-20">
          <Reveal fade className="mx-auto max-w-3xl text-center">
            {offering.fitTitle ? (
              <h2 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
                {offering.fitTitle}
              </h2>
            ) : null}
            {offering.fitBody ? (
              <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
                {offering.fitBody}
              </p>
            ) : null}
          </Reveal>
        </section>
      )}

      <HighlightsRail offering={offering} />
      <EngagementSections offering={offering} />
    </>
  );
}

function SignalLayout({ offering }: { offering: ServiceOffering }) {
  return (
    <>
      <FadeIn>
        <p className="mb-6 font-label text-xs tracking-[0.4em] text-outline uppercase">
          {offering.eyebrow}
        </p>
        <h1 className="max-w-4xl font-headline text-5xl font-bold leading-tight tracking-tighter text-white md:text-7xl">
          {offering.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          {offering.intro}
        </p>
      </FadeIn>

      <Reveal fade className="mt-16 md:mt-20">
        <OfferingImage
          src={offering.image.src}
          alt={offering.image.alt}
          className="aspect-[16/7] md:aspect-[21/8]"
          sizes="100vw"
          priority
        />
      </Reveal>

      <section className="mt-24 space-y-16 md:mt-32">
        {offering.highlights.map((item, index) => (
          <Reveal
            fade
            key={item.label}
            delay={index * 0.05}
            className="grid grid-cols-1 gap-4 border-t border-outline-variant/10 pt-10 md:grid-cols-12 md:gap-12"
          >
            <h2 className="font-headline text-2xl font-bold text-white md:col-span-4 md:text-3xl">
              {item.label}
            </h2>
            <p className="text-lg leading-relaxed text-on-surface-variant md:col-span-8">
              {item.body}
            </p>
          </Reveal>
        ))}
      </section>

      <EngagementSections offering={offering} />
    </>
  );
}

export function ServiceOfferingPage({ offering }: ServiceOfferingPageProps) {
  return (
    <>
      <div className="mx-auto max-w-screen-2xl px-8 pt-32 pb-24">
        {offering.layout === "showcase" ? <ShowcaseLayout offering={offering} /> : null}
        {offering.layout === "product" ? <ProductLayout offering={offering} /> : null}
        {offering.layout === "foundation" ? (
          <FoundationLayout offering={offering} />
        ) : null}
        {offering.layout === "device" ? <DeviceLayout offering={offering} /> : null}
        {offering.layout === "signal" ? <SignalLayout offering={offering} /> : null}
      </div>
      <ReadyWhenYouAre />
    </>
  );
}
