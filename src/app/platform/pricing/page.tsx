import type { Metadata } from "next";
import { FadeIn } from "@/components/atoms/FadeIn";
import { EmailPlanTiers } from "@/components/features/email/EmailPlanTiers";
import { PlanComparisonTable } from "@/components/features/email/PlanComparisonTable";

export const metadata: Metadata = {
  title: "Platform Pricing",
  description:
    "Free, Solo, and Team Form API plans metered by monthly form submissions.",
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
          Plans are based on monthly form submissions. Start on Free, then add
          Solo or Team when you need more volume or seats.
        </p>
      </FadeIn>

      <EmailPlanTiers className="mt-12" />
      <PlanComparisonTable className="mt-16" />
    </div>
  );
}
