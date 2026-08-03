"use client";

import { FadeIn } from "@/components/atoms/FadeIn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <Table className="min-w-[36rem]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Feature</TableHead>
            {FORM_PLANS.map((plan) => (
              <TableHead
                key={plan.id}
                className="font-headline text-base font-bold tracking-normal text-white normal-case"
              >
                {plan.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="text-on-surface-variant">
                {row.label}
              </TableCell>
              {FORM_PLANS.map((plan) => (
                <TableCell key={plan.id} className="text-white">
                  {row.value(plan)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </FadeIn>
  );
}
