import Link from "next/link";
import { FadeIn } from "@/components/atoms/FadeIn";
import { Reveal } from "@/components/atoms/Reveal";
import { PLATFORM_PATHS, PORTAL_PATHS } from "@/lib/sites";

export function PlatformOverview() {
  return (
    <div>
      <FadeIn>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
          Trashbox CRM
        </p>
        <h1 className="max-w-4xl font-headline text-5xl font-bold leading-tight tracking-tighter text-white md:text-7xl">
          Trashbox CRM for retention{" "}
          <span className="text-outline">and lead generation.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-on-surface-variant">
          Trashbox CRM is built for customer retention and lead generation—so you can follow up
          faster, stay organized, and keep more conversations moving.
        </p>
        <p className="mt-4 max-w-2xl text-base text-on-surface-variant">
          Email templates help increase customer response rates by 40%. Pair that with built-in
          messaging and replies, lead management, and secure team access.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={PORTAL_PATHS.signup}
            className="bg-primary px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80"
          >
            Get started
          </Link>
          <Link
            href={PORTAL_PATHS.login}
            className="border border-outline-variant/30 px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-white"
          >
            Login
          </Link>
        </div>
      </FadeIn>

      <section className="mt-32 grid grid-cols-1 items-start gap-12 lg:mt-40 lg:grid-cols-12 lg:gap-20">
        <Reveal fade className="lg:col-span-4 lg:sticky lg:top-32">
          <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
            Capture
          </span>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
            Every lead in one place.
          </h2>
        </Reveal>
        <Reveal fade className="space-y-6 lg:col-span-8" delay={0.06}>
          <p className="text-lg leading-relaxed text-on-surface-variant md:text-xl">
            Connect your website forms so new inquiries land in Trashbox CRM the moment they come
            in. No spreadsheet chase, no shared inbox scramble—just a clear queue of people who
            asked to hear from you.
          </p>
          <p className="text-base leading-relaxed text-on-surface-variant md:text-lg">
            Organize leads as they arrive, assign ownership, and see what still needs a reply
            before the trail goes cold.
          </p>
        </Reveal>
      </section>

      <section className="mt-32 grid grid-cols-1 items-start gap-12 lg:mt-40 lg:grid-cols-12 lg:gap-20">
        <Reveal fade className="lg:col-span-4 lg:sticky lg:top-32">
          <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
            Respond
          </span>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
            Reply faster. Sound consistent.
          </h2>
        </Reveal>
        <Reveal fade className="space-y-6 lg:col-span-8" delay={0.06}>
          <p className="text-lg leading-relaxed text-on-surface-variant md:text-xl">
            Built-in messaging and ready-to-use email templates keep follow-ups sharp without
            rewriting the same note every time. Teams using templates help increase customer
            response rates by 40%.
          </p>
          <p className="text-base leading-relaxed text-on-surface-variant md:text-lg">
            Keep the full thread next to the lead so anyone on your team can pick up the
            conversation without hunting through personal inboxes.
          </p>
        </Reveal>
      </section>

      <section className="mt-32 grid grid-cols-1 items-start gap-12 lg:mt-40 lg:grid-cols-12 lg:gap-20">
        <Reveal fade className="lg:col-span-4 lg:sticky lg:top-32">
          <span className="mb-4 block font-label text-xs tracking-[0.3em] text-primary/40 uppercase">
            Retain
          </span>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
            Keep relationships warm.
          </h2>
        </Reveal>
        <Reveal fade className="space-y-6 lg:col-span-8" delay={0.06}>
          <p className="text-lg leading-relaxed text-on-surface-variant md:text-xl">
            Retention isn&apos;t a separate product—it&apos;s timely follow-ups after the first
            contact. Stay close to customers with the same tools you use to win the lead.
          </p>
          <p className="text-base leading-relaxed text-on-surface-variant md:text-lg">
            Invite teammates with secure access so sales, support, and owners can help without
            sharing passwords—and without losing the thread.
          </p>
        </Reveal>
      </section>

      <section className="mt-32 border-t border-outline-variant/10 pt-20 lg:mt-40">
        <Reveal fade>
          <h2 className="max-w-3xl font-headline text-3xl font-bold tracking-tight text-white md:text-5xl">
            Start free. Grow when volume does.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-on-surface-variant">
            Capture your first leads on Free, then move to Solo or Team when you need more
            submissions, seats, and room to scale.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={PLATFORM_PATHS.features}
              className="border border-outline-variant/30 px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-white"
            >
              See features
            </Link>
            <Link
              href={PLATFORM_PATHS.pricing}
              className="bg-primary px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80"
            >
              View pricing
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
