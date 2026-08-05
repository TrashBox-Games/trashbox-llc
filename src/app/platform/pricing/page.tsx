import type { Metadata } from "next";
import { FadeIn } from "@/components/atoms/FadeIn";
import { EmailPlanTiers } from "@/components/features/email/EmailPlanTiers";
import { PlanComparisonTable } from "@/components/features/email/PlanComparisonTable";

export const metadata: Metadata = {
  title: "Trashbox CRM Pricing",
  description:
    "Free, Solo, and Team Trashbox CRM plans for lead generation, retention, and growing teams.",
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
          Choose a plan that fits how many leads you handle each month. Start free, then move to
          Solo or Team when you need more volume, templates, or seats.
        </p>
      </FadeIn>

      <EmailPlanTiers className="mt-12" />
      <PlanComparisonTable className="mt-16" />
    </div>
  );
}
