"use client";

import { documentToEmailHtml } from "@/lib/email-template-document";
import type { EmailTemplateDocument } from "@/lib/email-template-document";
import { cn } from "@/lib/utils";

export interface BuilderPreviewProps {
  document: EmailTemplateDocument;
  /** When set, render this HTML instead of serializing `document`. */
  htmlOverride?: string;
  className?: string;
}

export function BuilderPreview({
  document: doc,
  htmlOverride,
  className,
}: BuilderPreviewProps): React.ReactElement {
  const html = htmlOverride ?? documentToEmailHtml(doc);
  return (
    <iframe
      title="Template preview"
      sandbox=""
      srcDoc={html}
      className={cn("h-full min-h-[480px] w-full border-0 bg-white", className)}
    />
  );
}
