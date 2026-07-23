import type { Metadata } from "next";
import { FadeIn } from "@/components/atoms/FadeIn";
import { EmailPlanTiers } from "@/components/features/email/EmailPlanTiers";
import { PORTAL_PATHS } from "@/lib/sites";

export const metadata: Metadata = {
  title: "Platform Pricing",
  description: "Basic and Premium Form API plans for Trashbox Platform.",
};

export default function PortalPricingPage() {
  return (
    <div>
      <FadeIn>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
          Pricing
        </p>
        <h1 className="max-w-3xl font-headline text-4xl font-bold tracking-tighter text-white md:text-6xl">
          Simple plans. Free to start.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-on-surface-variant">
          Create a Form API account after you sign in, then add Basic or Premium when you need paid
          email volume.
        </p>
      </FadeIn>

      <EmailPlanTiers className="mt-12" />

      <div className="mt-14 text-center">
        <a
          href={PORTAL_PATHS.login}
          className="inline-block bg-primary px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80"
        >
          Login to subscribe
        </a>
      </div>
    </div>
  );
}
