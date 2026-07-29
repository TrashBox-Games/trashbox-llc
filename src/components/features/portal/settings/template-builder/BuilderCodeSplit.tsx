"use client";

import { useEffect, useState } from "react";
import { BuilderPreview } from "@/components/features/portal/settings/template-builder/BuilderPreview";
import { Button } from "@/components/ui/button";
import {
  documentToEmailHtml,
  parseDocumentFromHtml,
  type EmailTemplateDocument,
} from "@/lib/email-template-document";
import { cn } from "@/lib/utils";

export interface BuilderCodeSplitProps {
  document: EmailTemplateDocument;
  onApply: (next: EmailTemplateDocument) => void;
  className?: string;
}

/** Pretty-print a single-line-ish HTML dump for the code pane. */
export function formatEmailHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";
  return trimmed
    .replace(/></g, ">\n<")
    .replace(/\n{3,}/g, "\n\n");
}

export function BuilderCodeSplit({
  document: doc,
  onApply,
  className,
}: BuilderCodeSplitProps): React.ReactElement {
  const serialized = formatEmailHtml(documentToEmailHtml(doc));
  const [draft, setDraft] = useState(serialized);
  const [previewHtml, setPreviewHtml] = useState(documentToEmailHtml(doc));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = formatEmailHtml(documentToEmailHtml(doc));
    setDraft(next);
    setPreviewHtml(documentToEmailHtml(doc));
    setError(null);
  }, [doc]);

  function applyDraft() {
    try {
      const parsed = parseDocumentFromHtml(draft);
      onApply(parsed);
      setPreviewHtml(documentToEmailHtml(parsed));
      setDraft(formatEmailHtml(documentToEmailHtml(parsed)));
      setError(null);
    } catch {
      setError("Could not parse HTML. Check markers and try again.");
    }
  }

  return (
    <div
      data-testid="builder-code-split"
      className={cn(
        "grid min-h-0 flex-1 grid-cols-1 divide-y divide-zinc-200 md:grid-cols-2 md:divide-x md:divide-y-0",
        className,
      )}
    >
      <div className="flex min-h-0 min-w-0 flex-col bg-zinc-100">
        <div className="flex h-9 items-center border-b border-zinc-200 bg-white px-3">
          <span className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
            Page
          </span>
        </div>
        <BuilderPreview
          document={doc}
          htmlOverride={previewHtml}
          className="min-h-0 flex-1"
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-col bg-[#1e1e1e]">
        <div className="flex h-9 items-center justify-between gap-2 border-b border-zinc-700 bg-[#252526] px-3">
          <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
            Raw HTML
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 rounded-none border-zinc-600 bg-transparent px-2 text-[11px] text-zinc-200 hover:bg-zinc-700 hover:text-white"
            onClick={applyDraft}
          >
            Apply
          </Button>
        </div>
        <label className="sr-only" htmlFor="builder-raw-html">
          Raw HTML
        </label>
        <textarea
          id="builder-raw-html"
          aria-label="Raw HTML"
          spellCheck={false}
          value={draft}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            setPreviewHtml(next);
            setError(null);
          }}
          className="min-h-[320px] flex-1 resize-none border-0 bg-[#1e1e1e] p-3 font-mono text-[12px] leading-relaxed text-[#d4d4d4] outline-none"
        />
        {error ? (
          <p className="border-t border-red-900/60 bg-red-950/40 px-3 py-2 text-[11px] text-red-300">
            {error}
          </p>
        ) : (
          <p className="border-t border-zinc-700 px-3 py-2 text-[10px] text-zinc-500">
            Edit HTML, then Apply to update the page. Keep{" "}
            <code className="text-zinc-400">data-tb-*</code> markers for
            round-trip editing.
          </p>
        )}
      </div>
    </div>
  );
}
