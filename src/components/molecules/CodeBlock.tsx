"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
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
        <button
          type="button"
          onClick={() => void onCopy()}
          aria-label={copied ? "Copied" : "Copy"}
          className="inline-flex items-center gap-1.5 font-headline text-[10px] font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white"
        >
          <MaterialIcon
            name={copied ? "check" : "content_copy"}
            className="text-sm"
          />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-on-surface-variant md:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
