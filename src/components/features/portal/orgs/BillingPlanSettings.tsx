"use client";

import { Button } from "@/components/ui/button";
import type { OrgSummary } from "@/lib/api";
import { usePortal } from "@/lib/portal";

interface BillingPlanSettingsProps {
  org: OrgSummary;
  /** When true, show upgrade / manage actions. */
  showActions?: boolean;
}

/** Organization billing: current plan summary and Stripe checkout/portal actions. */
export function BillingPlanSettings({
  org,
  showActions = true,
}: BillingPlanSettingsProps) {
  const portal = usePortal();
  const isOwner = org.role === "owner";
  const hasProjects = org.projects.length > 0;
  const tier = portal.account?.tier ?? org.tier;
  const hasBilling = portal.account?.hasBilling ?? org.hasBilling;
  const emailsUsed = portal.account?.emailsUsed;
  const emailLimit = portal.account?.emailLimit;

  if (!isOwner) {
    return (
      <p className="text-on-surface-variant">
        Only the organization owner can manage billing.
      </p>
    );
  }

  if (!hasProjects) {
    return (
      <p className="text-on-surface-variant">
        Create a project in this organization before starting a paid plan.
      </p>
    );
  }

  return (
    <section className="border-outline-variant/10 bg-surface-container-low border p-6 md:p-8">
      <p className="font-label text-outline text-[10px] tracking-widest uppercase">
        Subscription
      </p>
      <h3 className="font-headline mt-3 text-2xl font-bold text-white md:text-3xl">
        {hasBilling
          ? tier === "premium"
            ? "Premium"
            : "Basic"
          : "No paid plan yet"}
      </h3>
      <p className="text-on-surface-variant mt-3 max-w-2xl text-sm leading-relaxed">
        {hasBilling
          ? tier === "premium"
            ? "Premium includes up to 5 team seats, email alerts to opted-in teammates, and confirmation emails to form submitters."
            : "Basic includes 1 team seat (you) and email alerts to opted-in teammates. Upgrade to Premium for 5 seats and submitter confirmations."
          : "Your organization is ready. Add a Stripe plan when you want paid Basic or Premium billing."}
      </p>
      {typeof emailsUsed === "number" && typeof emailLimit === "number" ? (
        <p className="font-label text-outline mt-4 text-[10px] tracking-widest uppercase">
          Usage:{" "}
          <span className="text-white">
            {emailsUsed.toLocaleString()} / {emailLimit.toLocaleString()}
          </span>{" "}
          emails this month
        </p>
      ) : null}
      {showActions ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {!hasBilling && (
            <>
              <Button
                type="button"
                disabled={portal.billingBusy}
                onClick={() => void portal.onUpgrade("premium")}
              >
                {portal.billingBusy ? "Redirecting…" : "Add Premium plan"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={portal.billingBusy}
                onClick={() => void portal.onUpgrade("basic")}
              >
                {portal.billingBusy ? "Redirecting…" : "Add Basic plan"}
              </Button>
            </>
          )}
          {hasBilling && tier !== "premium" && (
            <Button
              type="button"
              disabled={portal.billingBusy}
              onClick={() => void portal.onUpgrade("premium")}
            >
              {portal.billingBusy ? "Redirecting…" : "Upgrade to Premium"}
            </Button>
          )}
          {hasBilling && (
            <Button
              type="button"
              variant="outline"
              disabled={portal.billingBusy}
              onClick={() => void portal.onManageBilling()}
            >
              {portal.billingBusy ? "Redirecting…" : "Manage subscription"}
            </Button>
          )}
        </div>
      ) : null}
      {portal.billingError ? (
        <p className="mt-4 text-sm text-red-300">{portal.billingError}</p>
      ) : null}
    </section>
  );
}
