"use client";

import { EmailPlanTiers } from "@/components/features/email/EmailPlanTiers";
import { PlanComparisonTable } from "@/components/features/email/PlanComparisonTable";
import { PortalLink } from "@/components/features/portal/PortalLink";
import { SubmissionUsageMeter } from "@/components/features/portal/orgs/SubmissionUsageMeter";
import { Button } from "@/components/ui/button";
import type { OrgSummary } from "@/lib/api";
import {
  normalizePlanTier,
  planDisplayName,
  type PlanTier,
} from "@/lib/form-plans";
import { usePortal } from "@/lib/portal";
import { portalWorkspacePath } from "@/lib/portal-routes";

interface BillingPlanSettingsProps {
  org: OrgSummary;
  /** When true, show upgrade / manage actions. */
  showActions?: boolean;
}

function tierLabel(tier: PlanTier, hasBilling: boolean): string {
  if (!hasBilling && tier === "free") return "Free";
  if (!hasBilling && tier === "solo") return "Free";
  return planDisplayName(tier);
}

/** Organization billing: current plan summary and Stripe checkout/portal actions. */
export function BillingPlanSettings({
  org,
  showActions = true,
}: BillingPlanSettingsProps) {
  const portal = usePortal();
  const isOwner = org.role === "owner";
  const hasProjects = org.projects.length > 0;
  const tier = normalizePlanTier(portal.account?.tier ?? org.tier);
  const hasBilling = portal.account?.hasBilling ?? org.hasBilling;
  const submissionsUsed = portal.account?.submissionsUsed;
  const submissionLimit = portal.account?.submissionLimit;
  const effectiveTier: PlanTier =
    !hasBilling && (tier === "solo" || tier === "free") ? "free" : tier;

  if (!isOwner) {
    return (
      <p className="text-on-surface-variant">
        Only the organization owner can manage billing.
      </p>
    );
  }

  if (!hasProjects) {
    return (
      <div className="space-y-4">
        <p className="text-on-surface-variant">
          Create a project before starting a paid plan.
        </p>
        <Button asChild type="button" size="sm">
          <PortalLink
            href={portalWorkspacePath({
              orgSlug: org.orgSlug,
              surface: "orgHome",
            })}
          >
            Create project
          </PortalLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="border-outline-variant/10 bg-surface-container-low border p-6 md:p-8">
        <p className="font-label text-outline text-[10px] tracking-widest uppercase">
          Subscription
        </p>
        <h3 className="font-headline mt-3 text-2xl font-bold text-white md:text-3xl">
          {tierLabel(effectiveTier, hasBilling)}
        </h3>
        <p className="text-on-surface-variant mt-3 max-w-2xl text-sm leading-relaxed">
          {effectiveTier === "team"
            ? "Team includes up to 5 seats, 5,000 submissions / month, and submitter confirmations."
            : effectiveTier === "solo" && hasBilling
              ? "Solo includes 1 seat and 500 submissions / month. Upgrade to Team for more seats and confirmations."
              : "Free includes 10 submissions / month and 1 seat. Add Solo or Team when you need more."}
        </p>
        {typeof submissionsUsed === "number" &&
        typeof submissionLimit === "number" ? (
          <SubmissionUsageMeter
            className="mt-6"
            used={submissionsUsed}
            limit={submissionLimit}
          />
        ) : null}
        {showActions ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {(!hasBilling || effectiveTier === "free") && (
              <>
                <Button
                  type="button"
                  disabled={portal.billingBusy}
                  onClick={() => void portal.onUpgrade("team")}
                >
                  {portal.billingBusy ? "Redirecting…" : "Add Team plan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={portal.billingBusy}
                  onClick={() => void portal.onUpgrade("solo")}
                >
                  {portal.billingBusy ? "Redirecting…" : "Add Solo plan"}
                </Button>
              </>
            )}
            {hasBilling && effectiveTier === "solo" && (
              <Button
                type="button"
                disabled={portal.billingBusy}
                onClick={() => void portal.onUpgrade("team")}
              >
                {portal.billingBusy ? "Redirecting…" : "Upgrade to Team"}
              </Button>
            )}
            {hasBilling && (
              <Button
                type="button"
                variant="outline"
                disabled={portal.billingBusy}
                onClick={() => void portal.onManageBilling()}
              >
                {portal.billingBusy ? "Redirecting…" : "Manage billing"}
              </Button>
            )}
          </div>
        ) : null}
        {portal.billingError ? (
          <p className="mt-4 text-sm text-red-300">{portal.billingError}</p>
        ) : null}
      </section>

      <EmailPlanTiers
        currentPlan={effectiveTier}
        className="mt-0"
        busy={portal.billingBusy}
        onSelectPlan={(plan) => {
          if (plan === "free") {
            if (hasBilling) void portal.onManageBilling();
            return;
          }
          void portal.onUpgrade(plan);
        }}
      />
      <PlanComparisonTable className="mt-0" />
    </div>
  );
}
