"use client";

import { FadeIn } from "@/components/atoms/FadeIn";
import { FormsSettings } from "@/components/features/portal/settings/FormsSettings";
import type { FormsSettingsInitialState } from "@/components/features/portal/settings/FormsSettings";
import { usePortal } from "@/lib/portal";

interface FormsPageProps {
  /** Storybook/demo seed for nested API-backed section. */
  initialState?: FormsSettingsInitialState;
}

/** Project-level Forms surface — card grid matching the projects home. */
export function FormsPage({ initialState }: FormsPageProps) {
  const portal = usePortal();
  const projectName =
    portal.account?.projectName ||
    portal.account?.clientName ||
    portal.clientName ||
    "Project";

  return (
    <div className="space-y-10">
      <FadeIn>
        <p className="font-label text-outline mb-6 text-xs tracking-[0.4em] uppercase">
          {projectName}
        </p>
        <h1 className="font-headline max-w-4xl text-4xl leading-tight font-bold tracking-tighter text-white md:text-5xl">
          Forms.
        </h1>
        <p className="text-on-surface-variant mt-4 max-w-xl text-lg">
          Named forms share this project&apos;s API key. Pass{" "}
          <code className="text-white">slug</code> or{" "}
          <code className="text-white">formId</code> on submit to tag leads.
        </p>
      </FadeIn>
      <FormsSettings initialState={initialState} />
    </div>
  );
}
