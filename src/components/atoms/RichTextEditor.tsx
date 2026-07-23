"use client";

import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RichTextValue {
  html: string;
  text: string;
}

interface RichTextEditorProps {
  onChange: (value: RichTextValue) => void;
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}

interface ToolbarButton {
  label: string;
  icon: string;
  command: string;
  value?: string;
  /** When true, prompt for a URL before running the command. */
  prompt?: boolean;
}

const FORMAT_GROUPS: ToolbarButton[][] = [
  [
    { label: "Bold", icon: "format_bold", command: "bold" },
    { label: "Italic", icon: "format_italic", command: "italic" },
    { label: "Underline", icon: "format_underlined", command: "underline" },
  ],
  [
    {
      label: "Bulleted list",
      icon: "format_list_bulleted",
      command: "insertUnorderedList",
    },
    {
      label: "Numbered list",
      icon: "format_list_numbered",
      command: "insertOrderedList",
    },
  ],
  [{ label: "Link", icon: "link", command: "createLink", prompt: true }],
];

export function RichTextEditor({
  onChange,
  ariaLabel,
  placeholder = "Write a message…",
  disabled = false,
  className,
  onKeyDown,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const text = el.textContent ?? "";
    setIsEmpty(text.trim().length === 0 && !el.querySelector("li, img"));
    onChange({ html: el.innerHTML, text });
  }, [onChange]);

  const runCommand = useCallback(
    (button: ToolbarButton) => {
      if (disabled) return;
      editorRef.current?.focus();
      let value = button.value;
      if (button.prompt) {
        const url = window.prompt("Enter a URL");
        if (!url) return;
        value = url;
      }
      // execCommand is deprecated but remains the only cross-browser way to do
      // inline rich-text formatting without pulling in a heavy editor library.
      document.execCommand(button.command, false, value);
      emit();
    },
    [disabled, emit],
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded border border-outline-variant/20 bg-surface-container-lowest/40",
        className,
      )}
    >
      <div
        className="flex flex-wrap items-center gap-1 border-b border-outline-variant/10 bg-surface-container/60 px-3 py-2"
        role="toolbar"
        aria-label="Formatting"
      >
        {FORMAT_GROUPS.map((group, groupIndex) => (
          <div
            key={group.map((b) => b.command).join("-")}
            className={cn(
              "flex items-center gap-0.5",
              groupIndex < FORMAT_GROUPS.length - 1 &&
                "mr-2 border-r border-outline-variant/10 pr-2",
            )}
          >
            {group.map((button) => (
              <Button
                key={button.command}
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={button.label}
                title={button.label}
                disabled={disabled}
                // Keep the editor selection when clicking a toolbar button.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand(button)}
                className="rounded text-outline hover:bg-surface-variant hover:text-white"
              >
                <MaterialIcon name={button.icon} className="text-lg" />
              </Button>
            ))}
          </div>
        ))}
      </div>

      <div className="relative">
        {isEmpty && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-3 text-sm italic text-outline-variant/60"
          >
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          role="textbox"
          aria-label={ariaLabel}
          aria-multiline="true"
          tabIndex={disabled ? -1 : 0}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={emit}
          onKeyDown={onKeyDown}
          className={cn(
            "min-h-[160px] w-full px-4 py-3 text-sm leading-relaxed text-white focus:outline-none",
            "[&_a]:text-primary [&_a]:underline",
            "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
            "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
            disabled && "opacity-60",
          )}
        />
      </div>
    </div>
  );
}

export type { RichTextEditorProps };
