"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
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

export interface RichTextEditorHandle {
  /** Replace the entire document and emit onChange. */
  setHtml: (html: string) => void;
  /** Insert HTML at the caret (or at the end when there is no selection). */
  insertHtml: (html: string) => void;
  focus: () => void;
  /** Plain text from the start of the document through the caret. */
  textBeforeCursor: () => string;
  /** Delete the last `count` characters before the caret, then insert HTML. */
  replaceCharsBeforeCursor: (count: number, html: string) => void;
}

interface RichTextEditorProps {
  onChange: (value: RichTextValue) => void;
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /**
   * Content to seed the editor with. The editor stays uncontrolled afterwards,
   * so callers that need to replace the content later should also change `key`
   * or call `setHtml` on the handle. No `onChange` fires for the seeded value —
   * seed the caller's state to match.
   */
  initialHtml?: string;
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

function readValue(el: HTMLDivElement): RichTextValue {
  return { html: el.innerHTML, text: el.textContent ?? "" };
}

function isVisuallyEmpty(el: HTMLDivElement): boolean {
  return (
    (el.textContent ?? "").trim().length === 0 && !el.querySelector("li, img")
  );
}

/** Prefer execCommand; fall back to Range APIs for jsdom / older engines. */
function insertHtmlAtSelection(html: string): boolean {
  if (typeof document.execCommand === "function") {
    const ok = document.execCommand("insertHTML", false, html);
    if (ok) return true;
  }
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const template = document.createElement("template");
  template.innerHTML = html;
  const fragment = template.content;
  const lastNode = fragment.lastChild;
  range.insertNode(fragment);
  if (lastNode) {
    range.setStartAfter(lastNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  return true;
}

function previousTextNode(node: Node, root: Node): Text | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  if (node.nodeType === Node.TEXT_NODE) {
    const index = nodes.indexOf(node as Text);
    return index > 0 ? nodes[index - 1]! : null;
  }
  return nodes.at(-1) ?? null;
}

/** Select `count` characters immediately before the caret. */
function extendSelectionBackward(
  selection: Selection,
  root: Node,
  count: number,
): void {
  if (selection.rangeCount === 0 || count <= 0) return;
  const caret = selection.getRangeAt(0);
  let remaining = count;
  let endNode: Node = caret.startContainer;
  let endOffset = caret.startOffset;
  let startNode: Node = endNode;
  let startOffset = endOffset;

  while (remaining > 0) {
    if (startNode.nodeType === Node.TEXT_NODE) {
      const take = Math.min(startOffset, remaining);
      startOffset -= take;
      remaining -= take;
      if (remaining === 0) break;
    }
    const previous = previousTextNode(startNode, root);
    if (!previous) break;
    startNode = previous;
    startOffset = previous.length;
  }

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  selection.removeAllRanges();
  selection.addRange(range);
}

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(function RichTextEditor(
  {
    onChange,
    ariaLabel,
    placeholder = "Write a message…",
    disabled = false,
    className,
    onKeyDown,
    initialHtml,
  },
  ref,
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    setIsEmpty(isVisuallyEmpty(el));
    onChange(readValue(el));
  }, [onChange]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || initialHtml === undefined) return;
    el.innerHTML = initialHtml;
    setIsEmpty(isVisuallyEmpty(el));
  }, [initialHtml]);

  useImperativeHandle(
    ref,
    () => ({
      setHtml(html: string) {
        const el = editorRef.current;
        if (!el) return;
        el.innerHTML = html;
        setIsEmpty(isVisuallyEmpty(el));
        onChange(readValue(el));
      },
      insertHtml(html: string) {
        const el = editorRef.current;
        if (!el || disabled) return;
        el.focus();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          el.innerHTML = `${el.innerHTML}${html}`;
          emit();
          return;
        }
        insertHtmlAtSelection(html);
        emit();
      },
      focus() {
        editorRef.current?.focus();
      },
      textBeforeCursor() {
        const el = editorRef.current;
        if (!el) return "";
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          return el.textContent ?? "";
        }
        const range = selection.getRangeAt(0).cloneRange();
        range.selectNodeContents(el);
        range.setEnd(
          selection.getRangeAt(0).endContainer,
          selection.getRangeAt(0).endOffset,
        );
        return range.toString();
      },
      replaceCharsBeforeCursor(count: number, html: string) {
        const el = editorRef.current;
        if (!el || disabled || count <= 0) return;
        el.focus();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        selection.collapseToEnd();
        extendSelectionBackward(selection, el, count);
        insertHtmlAtSelection(html);
        emit();
      },
    }),
    [disabled, emit, onChange],
  );

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
});

export type { RichTextEditorProps };
