import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/atoms/FadeIn";
import { PLATFORM_PATHS, PORTAL_PATHS } from "@/lib/sites";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "Trashbox Form API platform — form notifications, inbox, API keys, and billing for your business sites.",
  openGraph: {
    title: "Trashbox LLC - Platform",
  },
};

const cards = [
  {
    href: PLATFORM_PATHS.features,
    label: "Features",
    blurb: "Inbox, email alerts, API keys, and spam protection.",
  },
  {
    href: PLATFORM_PATHS.pricing,
    label: "Pricing",
    blurb: "Basic and Premium plans with monthly email quotas.",
  },
  {
    href: PLATFORM_PATHS.api,
    label: "API",
    blurb: "Submit forms with X-Api-Key against api.trashbox.io.",
  },
  {
    href: PLATFORM_PATHS.documentation,
    label: "Documentation",
    blurb: "Accounts, keys, billing, and the full OpenAPI reference.",
  },
] as const;

export default function PlatformHubPage() {
  return (
    <div>
      <FadeIn>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
          Platform
        </p>
        <h1 className="max-w-4xl font-headline text-5xl font-bold leading-tight tracking-tighter text-white md:text-7xl">
          Form API <span className="text-outline">for your sites.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-on-surface-variant">
          Capture contact-form submissions, get notified by email, and manage everything from one
          inbox. Start free, add a plan when you need more volume.
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

      <div className="mt-20 grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-outline-variant/10 bg-surface-container-low p-8 transition-colors hover:border-outline-variant/30"
          >
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              {card.label}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{card.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
