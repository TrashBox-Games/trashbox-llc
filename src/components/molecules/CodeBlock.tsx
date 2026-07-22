"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  /** Short language/label shown in the header bar (e.g. "bash", "json"). */
  language?: string;
  className?: string;
}

/** Reusable, copyable code block with an optional language label. */
export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden border border-outline-variant/10 bg-surface-container-low",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-outline-variant/10 px-4 py-2">
        <span className="font-label text-[10px] uppercase tracking-widest text-outline">
          {language ?? "code"}
        </span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void onCopy()}
          aria-label={copied ? "Copied" : "Copy"}
          className="h-auto gap-1.5 px-0 py-0 text-[10px] font-bold"
        >
          <MaterialIcon
            name={copied ? "check" : "content_copy"}
            className="text-sm"
          />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-on-surface-variant md:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
