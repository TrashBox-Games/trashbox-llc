"use client";

import { FadeIn } from "@/components/atoms/FadeIn";
import { FORM_PLANS } from "@/lib/form-plans";
import { cn } from "@/lib/utils";

const ROWS: {
  label: string;
  value: (plan: (typeof FORM_PLANS)[number]) => string;
}[] = [
  {
    label: "Submissions / month",
    value: (p) => p.submissionsPerMonth.toLocaleString(),
  },
  { label: "Team seats", value: (p) => String(p.seats) },
  { label: "Forms per project", value: (p) => String(p.formsPerProject) },
  { label: "Projects", value: (p) => p.projects },
  {
    label: "Submitter confirmation",
    value: (p) => (p.submitterConfirmation ? "Yes" : "—"),
  },
  { label: "Inbox + API", value: () => "Yes" },
];

type PlanComparisonTableProps = {
  className?: string;
};

/** Feature comparison grid for Free / Solo / Team. */
export function PlanComparisonTable({ className }: PlanComparisonTableProps) {
  return (
    <FadeIn className={cn(className ?? "mt-16")} delay={0.1}>
      <div className="mb-8 text-center">
        <p className="font-label text-[10px] tracking-[0.4em] text-outline uppercase">
          Compare
        </p>
        <h2 className="mt-4 font-headline text-2xl font-bold tracking-tight text-white md:text-3xl">
          Plan details
        </h2>
      </div>
      <div className="border-outline-variant/20 overflow-x-auto border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-outline-variant/20 border-b bg-surface-container-low">
              <th className="font-label text-outline px-4 py-3 text-[10px] tracking-widest uppercase">
                Feature
              </th>
              {FORM_PLANS.map((plan) => (
                <th
                  key={plan.id}
                  className="font-headline px-4 py-3 text-base font-bold text-white"
                >
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.label}
                className="border-outline-variant/10 border-b last:border-0"
              >
                <th className="text-on-surface-variant px-4 py-3 font-normal">
                  {row.label}
                </th>
                {FORM_PLANS.map((plan) => (
                  <td key={plan.id} className="px-4 py-3 text-white">
                    {row.value(plan)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FadeIn>
  );
}
