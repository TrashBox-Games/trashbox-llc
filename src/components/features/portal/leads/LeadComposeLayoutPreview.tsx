"use client";

import type { ReactElement } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LeadComposeLayoutPreviewProps {
  html: string;
  signatureHtml?: string;
  disabled?: boolean;
  onEdit: () => void;
  onRemove: () => void;
  className?: string;
}

export function LeadComposeLayoutPreview({
  html,
  signatureHtml,
  disabled = false,
  onEdit,
  onRemove,
  className,
}: LeadComposeLayoutPreviewProps): ReactElement {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative border-b border-outline-variant/20 bg-white">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label="Edit layout"
            title="Edit layout"
            disabled={disabled}
            onClick={onEdit}
            className="size-8 rounded-full border-0 bg-black/45 text-white shadow-sm backdrop-blur-sm hover:bg-black/60 hover:text-white"
          >
            <MaterialIcon name="edit" className="text-base" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label="Remove layout"
            title="Remove layout"
            disabled={disabled}
            onClick={onRemove}
            className="size-8 rounded-full border-0 bg-black/45 text-white shadow-sm backdrop-blur-sm hover:bg-black/60 hover:text-white"
          >
            <MaterialIcon name="close" className="text-base" />
          </Button>
        </div>
        <iframe
          title="Layout preview"
          sandbox=""
          srcDoc={html}
          className="min-h-[280px] w-full border-0 bg-white"
        />
      </div>
      {signatureHtml?.trim() ? (
        <div
          aria-label="Reply signature"
          className="text-on-surface-variant border-b border-outline-variant/20 px-4 py-3 text-sm"
          dangerouslySetInnerHTML={{ __html: signatureHtml }}
        />
      ) : null}
    </div>
  );
}
