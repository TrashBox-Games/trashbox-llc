"use client";

import { useEffect, useState } from "react";
import {
  LeadEmailThread,
  type LeadComposerLibrary,
  type LeadEmailThreadProps,
} from "@/components/features/portal/leads/LeadEmailThread";
import {
  ApiError,
  listEmailSignatures,
  listEmailSnippets,
  listEmailTemplates,
} from "@/lib/api";

export interface LeadEmailThreadSectionProps
  extends Omit<LeadEmailThreadProps, "library"> {
  /** When set, skip network load (Storybook / tests). */
  initialLibrary?: LeadComposerLibrary;
}

export function LeadEmailThreadSection({
  initialLibrary,
  mailboxConnected,
  ...threadProps
}: LeadEmailThreadSectionProps) {
  const [library, setLibrary] = useState<LeadComposerLibrary>(
    initialLibrary ?? { templates: [], signatures: [], snippets: [] },
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (initialLibrary || !mailboxConnected) return;

    let cancelled = false;
    async function loadLibrary() {
      try {
        const [templates, signatures, snippets] = await Promise.all([
          listEmailTemplates(),
          listEmailSignatures(),
          listEmailSnippets(),
        ]);
        if (cancelled) return;
        setLibrary({
          templates: templates.items,
          signatures: signatures.items,
          snippets: snippets.items,
        });
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Failed to load templates, signatures, and snippets",
        );
      }
    }

    void loadLibrary();
    return () => {
      cancelled = true;
    };
  }, [initialLibrary, mailboxConnected]);

  const error =
    [threadProps.error, loadError].filter(Boolean).join(" · ") || null;

  return (
    <LeadEmailThread
      {...threadProps}
      mailboxConnected={mailboxConnected}
      library={library}
      error={error}
    />
  );
}
