"use client";

import { FadeIn } from "@/components/atoms/FadeIn";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import {
  FORM_PLANS,
  type PlanTier,
} from "@/lib/form-plans";
import { PORTAL_PATHS } from "@/lib/sites";
import { cn } from "@/lib/utils";

/** @deprecated Use FORM_PLANS from @/lib/form-plans */
export const EMAIL_PLANS = FORM_PLANS;

type EmailPlanTiersProps = {
  currentPlan?: PlanTier | null;
  className?: string;
  busy?: boolean;
  /** Portal: choose a plan (Free may open billing portal to downgrade). */
  onSelectPlan?: (plan: PlanTier) => void;
};

function marketingHref(planId: PlanTier): string {
  return planId === "free" ? PORTAL_PATHS.signup : PORTAL_PATHS.login;
}

function actionLabel(
  planId: PlanTier,
  isCurrent: boolean,
  portalMode: boolean,
): string {
  if (isCurrent) return "Current plan";
  if (planId === "free") return portalMode ? "Manage plan" : "Get started";
  return `Choose ${planId === "solo" ? "Solo" : "Team"}`;
}

export function EmailPlanTiers({
  currentPlan = null,
  className,
  busy = false,
  onSelectPlan,
}: EmailPlanTiersProps) {
  return (
    <FadeIn className={cn(className ?? "mt-20")} delay={0.08}>
      <div className="mb-10 text-center">
        <p className="font-label text-[10px] tracking-[0.4em] text-outline uppercase">
          Pricing
        </p>
        <h2 className="mt-4 font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
          Subscription plans
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-on-surface-variant">
          Start free with 10 submissions a month. Upgrade when you need more
          volume or teammates.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {FORM_PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const portalMode = Boolean(onSelectPlan);
          const label = actionLabel(plan.id, isCurrent, portalMode);
          const featured = "featured" in plan && plan.featured;

          return (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col border p-8 transition-colors",
                featured
                  ? "border-white/40 bg-surface-container-high"
                  : "border-outline-variant/20 bg-surface-container-low",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-label text-[10px] tracking-widest text-outline uppercase">
                    {featured
                      ? "Recommended"
                      : plan.id === "free"
                        ? "Start"
                        : "Paid"}
                  </p>
                  <h3 className="mt-2 font-headline text-2xl font-bold text-white">
                    {plan.name}
                  </h3>
                </div>
                {isCurrent && (
                  <span className="font-label text-[10px] tracking-widest text-white uppercase">
                    Current
                  </span>
                )}
              </div>

              <p className="mt-6 font-headline text-4xl font-bold tracking-tight text-white">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
                {plan.price > 0 ? (
                  <span className="ml-1 text-base font-normal text-outline">
                    /mo
                  </span>
                ) : null}
              </p>
              <p className="mt-2 font-headline text-lg tracking-tight text-white">
                {plan.submissionsPerMonth.toLocaleString()}
                <span className="ml-1 text-sm font-normal text-outline">
                  submissions
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                {plan.blurb}
              </p>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-3 text-sm text-on-surface-variant"
                  >
                    <MaterialIcon name="check" className="mt-0.5 text-white" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {onSelectPlan ? (
                  <Button
                    type="button"
                    className="w-full"
                    variant={featured && !isCurrent ? "default" : "outline"}
                    disabled={busy || isCurrent}
                    onClick={() => onSelectPlan(plan.id)}
                  >
                    {busy && !isCurrent ? "Redirecting…" : label}
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full"
                    variant={featured ? "default" : "outline"}
                  >
                    <a href={marketingHref(plan.id)}>{label}</a>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </FadeIn>
  );
}
