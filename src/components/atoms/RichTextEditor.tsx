"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HexColorPicker } from "react-colorful";

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
  /** Inserted at the start of the formatting toolbar (e.g. library menus). */
  toolbarStart?: ReactNode;
  /** Inserted at the end of the formatting toolbar. */
  toolbarEnd?: ReactNode;
}

interface ToolbarButton {
  label: string;
  icon: string;
  command: string;
  value?: string;
  prompt?: "url" | "image";
}

const FONT_OPTIONS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
] as const;

/** Common sizes shown in the dropdown; any integer px is allowed via the input. */
const FONT_SIZE_PRESETS = [10, 12, 14, 16, 18, 24, 32, 48] as const;
const DEFAULT_FONT_SIZE_PX = 14;
const MIN_FONT_SIZE_PX = 8;
const MAX_FONT_SIZE_PX = 200;

const COLOR_PALETTE = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#ffffff",
  "#e53935",
  "#fb8c00",
  "#fdd835",
  "#43a047",
  "#1e88e5",
  "#8e24aa",
  "#00acc1",
] as const;

const DEFAULT_TEXT_COLOR = "#ffffff";
const DEFAULT_HIGHLIGHT_COLOR = "#fdd835";

type ColorFormat = "hex" | "rgb" | "hsl" | "hsv";

const COLOR_FORMATS: { id: ColorFormat; label: string }[] = [
  { id: "hex", label: "Hex" },
  { id: "rgb", label: "RGB" },
  { id: "hsl", label: "HSL" },
  { id: "hsv", label: "HSV" },
];

function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(withHash)) return null;
  return withHash.toLowerCase();
}

function clampChannel(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHexColor(hex) ?? DEFAULT_TEXT_COLOR;
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (channel: number) =>
    clampChannel(channel, 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rn:
      h = (gn - bn) / d + (gn < bn ? 6 : 0);
      break;
    case gn:
      h = (bn - rn) / d + 2;
      break;
    default:
      h = (rn - gn) / d + 4;
      break;
  }
  return {
    h: Math.round(h * 60),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  const hn = ((h % 360) + 360) % 360;
  const sn = clampChannel(s, 0, 100) / 100;
  const ln = clampChannel(l, 0, 100) / 100;
  if (sn === 0) {
    const gray = Math.round(ln * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hk = hn / 360;
  return {
    r: Math.round(hue2rgb(p, q, hk + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hk) * 255),
    b: Math.round(hue2rgb(p, q, hk - 1 / 3) * 255),
  };
}

function rgbToHsv(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; v: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / d + 2) * 60;
        break;
      default:
        h = ((rn - gn) / d + 4) * 60;
        break;
    }
  }
  return {
    h: Math.round(h),
    s: Math.round(max === 0 ? 0 : (d / max) * 100),
    v: Math.round(max * 100),
  };
}

function hsvToRgb(
  h: number,
  s: number,
  v: number,
): { r: number; g: number; b: number } {
  const hn = (((h % 360) + 360) % 360) / 60;
  const sn = clampChannel(s, 0, 100) / 100;
  const vn = clampChannel(v, 0, 100) / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs((hn % 2) - 1));
  const m = vn - c;
  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (hn >= 0 && hn < 1) [rn, gn, bn] = [c, x, 0];
  else if (hn < 2) [rn, gn, bn] = [x, c, 0];
  else if (hn < 3) [rn, gn, bn] = [0, c, x];
  else if (hn < 4) [rn, gn, bn] = [0, x, c];
  else if (hn < 5) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];
  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
}

const EMOJIS = [
  "👍",
  "👎",
  "✅",
  "❌",
  "🙏",
  "😊",
  "😂",
  "😮",
  "😢",
  "🔥",
  "🎉",
  "💡",
  "📅",
  "📎",
  "✉️",
  "🚚",
] as const;

const ALIGN_OPTIONS = [
  { label: "Align left", command: "justifyLeft", icon: "format_align_left" },
  {
    label: "Align center",
    command: "justifyCenter",
    icon: "format_align_center",
  },
  { label: "Align right", command: "justifyRight", icon: "format_align_right" },
] as const;

const STYLE_BUTTONS: ToolbarButton[] = [
  { label: "Bold", icon: "format_bold", command: "bold" },
  { label: "Italic", icon: "format_italic", command: "italic" },
  { label: "Underline", icon: "format_underlined", command: "underline" },
  {
    label: "Strikethrough",
    icon: "format_strikethrough",
    command: "strikeThrough",
  },
];

const LIST_BUTTONS: ToolbarButton[] = [
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
];

const INDENT_BUTTONS: ToolbarButton[] = [
  {
    label: "Decrease indent",
    icon: "format_indent_decrease",
    command: "outdent",
  },
  {
    label: "Increase indent",
    icon: "format_indent_increase",
    command: "indent",
  },
];

const INSERT_BUTTONS: ToolbarButton[] = [
  { label: "Link", icon: "link", command: "createLink", prompt: "url" },
  {
    label: "Insert image",
    icon: "image",
    command: "insertImage",
    prompt: "image",
  },
  {
    label: "Blockquote",
    icon: "format_quote",
    command: "formatBlock",
    value: "blockquote",
  },
  { label: "Clear formatting", icon: "format_clear", command: "removeFormat" },
];

const toolbarBtnClass =
  "rounded text-outline hover:bg-surface-variant hover:text-white";

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

function clampFontSizePx(value: number): number {
  return Math.min(
    MAX_FONT_SIZE_PX,
    Math.max(MIN_FONT_SIZE_PX, Math.round(value)),
  );
}

/** Apply an arbitrary pixel font size to the current selection. */
function applyFontSizeToSelection(px: number): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const size = `${px}px`;

  if (range.collapsed) {
    const span = document.createElement("span");
    span.style.fontSize = size;
    span.appendChild(document.createTextNode("\u200b"));
    range.insertNode(span);
    const next = document.createRange();
    next.setStart(span.firstChild!, 1);
    next.collapse(true);
    selection.removeAllRanges();
    selection.addRange(next);
    return;
  }

  const span = document.createElement("span");
  span.style.fontSize = size;
  try {
    range.surroundContents(span);
  } catch {
    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);
  }
  selection.removeAllRanges();
  const next = document.createRange();
  next.selectNodeContents(span);
  next.collapse(false);
  selection.addRange(next);
}

function ToolbarIconButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={toolbarBtnClass}
    >
      <MaterialIcon name={icon} className="text-lg" />
    </Button>
  );
}

/** Trigger for menus/popovers — always shows a dropdown chevron. */
const ToolbarMenuButton = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    icon?: string;
    text?: string;
    textStyle?: CSSProperties;
    /** Optional color chip under the icon (text/highlight tools). */
    swatchColor?: string;
    disabled?: boolean;
    className?: string;
  } & ComponentPropsWithoutRef<"button">
>(function ToolbarMenuButton(
  {
    label,
    icon,
    text,
    textStyle,
    swatchColor,
    disabled,
    className,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <Button
      ref={ref}
      type={type}
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        toolbarBtnClass,
        "h-8 gap-0.5 px-1.5 font-body text-xs font-normal normal-case tracking-normal",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="relative inline-flex flex-col items-center">
          <MaterialIcon name={icon} className="text-lg" />
          {swatchColor ? (
            <span
              aria-hidden="true"
              className="border-outline-variant/40 absolute -bottom-0.5 h-0.5 w-3.5 rounded-full border"
              style={{ backgroundColor: swatchColor }}
            />
          ) : null}
        </span>
      ) : null}
      {text ? (
        <span className="max-w-[7.5rem] truncate" style={textStyle}>
          {text}
        </span>
      ) : null}
      <MaterialIcon name="arrow_drop_down" className="text-base opacity-70" />
    </Button>
  );
});

function ToolbarGroup({
  children,
  withDivider,
}: {
  children: ReactNode;
  withDivider?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        withDivider && "border-outline-variant/10 mr-2 border-r pr-2",
      )}
    >
      {children}
    </div>
  );
}

function ColorChannelInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="font-label text-[10px] uppercase tracking-widest text-outline">
        {label}
      </span>
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        aria-label={label}
        value={value}
        onChange={(event) =>
          onChange(clampChannel(Number(event.target.value), min, max))
        }
        className="h-8 border-outline-variant/30 bg-surface-container-lowest px-2 py-1 font-mono text-xs"
      />
    </label>
  );
}

function ColorPickerPanel({
  labelPrefix,
  value,
  onChange,
  onCancel,
}: {
  labelPrefix: string;
  value: string;
  onChange: (color: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [format, setFormat] = useState<ColorFormat>("hex");

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const draftHex = normalizeHexColor(draft) ?? value;
  const rgb = hexToRgb(draftHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  function confirm() {
    const next = normalizeHexColor(draft);
    if (!next) return;
    onChange(next);
  }

  function setFromRgb(next: { r: number; g: number; b: number }) {
    setDraft(rgbToHex(next.r, next.g, next.b));
  }

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label={`${labelPrefix} color format`}
        className="bg-surface-container-lowest/60 flex gap-0.5 rounded-sm p-0.5"
      >
        {COLOR_FORMATS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={format === option.id}
            className={cn(
              "font-label flex-1 rounded-sm px-1.5 py-1 text-[10px] uppercase tracking-widest transition-colors",
              format === option.id
                ? "bg-surface-bright text-white"
                : "text-outline hover:text-white",
            )}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setFormat(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        {format === "hex" ? (
          <Input
            aria-label={`${labelPrefix} hex color`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="#ffffff"
            className="h-8 border-outline-variant/30 bg-surface-container-lowest px-2 py-1 font-mono text-xs"
          />
        ) : null}
        {format === "rgb" ? (
          <>
            <ColorChannelInput
              label={`${labelPrefix} R`}
              value={rgb.r}
              min={0}
              max={255}
              onChange={(r) => setFromRgb({ ...rgb, r })}
            />
            <ColorChannelInput
              label={`${labelPrefix} G`}
              value={rgb.g}
              min={0}
              max={255}
              onChange={(g) => setFromRgb({ ...rgb, g })}
            />
            <ColorChannelInput
              label={`${labelPrefix} B`}
              value={rgb.b}
              min={0}
              max={255}
              onChange={(b) => setFromRgb({ ...rgb, b })}
            />
          </>
        ) : null}
        {format === "hsl" ? (
          <>
            <ColorChannelInput
              label={`${labelPrefix} H`}
              value={hsl.h}
              min={0}
              max={360}
              onChange={(h) => {
                const next = hslToRgb(h, hsl.s, hsl.l);
                setFromRgb(next);
              }}
            />
            <ColorChannelInput
              label={`${labelPrefix} S`}
              value={hsl.s}
              min={0}
              max={100}
              onChange={(s) => {
                const next = hslToRgb(hsl.h, s, hsl.l);
                setFromRgb(next);
              }}
            />
            <ColorChannelInput
              label={`${labelPrefix} L`}
              value={hsl.l}
              min={0}
              max={100}
              onChange={(l) => {
                const next = hslToRgb(hsl.h, hsl.s, l);
                setFromRgb(next);
              }}
            />
          </>
        ) : null}
        {format === "hsv" ? (
          <>
            <ColorChannelInput
              label={`${labelPrefix} H`}
              value={hsv.h}
              min={0}
              max={360}
              onChange={(h) => {
                const next = hsvToRgb(h, hsv.s, hsv.v);
                setFromRgb(next);
              }}
            />
            <ColorChannelInput
              label={`${labelPrefix} S`}
              value={hsv.s}
              min={0}
              max={100}
              onChange={(s) => {
                const next = hsvToRgb(hsv.h, s, hsv.v);
                setFromRgb(next);
              }}
            />
            <ColorChannelInput
              label={`${labelPrefix} V`}
              value={hsv.v}
              min={0}
              max={100}
              onChange={(v) => {
                const next = hsvToRgb(hsv.h, hsv.s, v);
                setFromRgb(next);
              }}
            />
          </>
        ) : null}
        <span
          aria-hidden="true"
          className="border-outline-variant/30 size-8 shrink-0 rounded-sm border"
          style={{ backgroundColor: draftHex }}
        />
      </div>

      <div
        aria-label={`${labelPrefix} color picker`}
        className="[&_.react-colorful]:h-[140px] [&_.react-colorful]:w-full"
      >
        <HexColorPicker color={draftHex} onChange={setDraft} />
      </div>

      <div className="grid grid-cols-6 gap-1">
        {COLOR_PALETTE.map((color) => (
          <button
            key={`${labelPrefix}-${color}`}
            type="button"
            aria-label={`${labelPrefix} ${color}`}
            title={color}
            className={cn(
              "border-outline-variant/30 size-6 rounded-sm border",
              color.toLowerCase() === draftHex.toLowerCase() &&
                "ring-1 ring-primary ring-offset-1 ring-offset-surface-container-high",
            )}
            style={{ backgroundColor: color }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setDraft(color)}
          />
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="normal-case tracking-normal text-outline hover:text-white"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="xs"
          className="normal-case tracking-normal"
          onMouseDown={(event) => event.preventDefault()}
          onClick={confirm}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
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
    toolbarStart,
    toolbarEnd,
  },
  ref,
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [font, setFont] = useState<(typeof FONT_OPTIONS)[number]>("Arial");
  const [fontSizePx, setFontSizePx] = useState(DEFAULT_FONT_SIZE_PX);
  const [fontSizeDraft, setFontSizeDraft] = useState(
    String(DEFAULT_FONT_SIZE_PX),
  );
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [highlightColor, setHighlightColor] = useState(DEFAULT_HIGHLIGHT_COLOR);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    setIsEmpty(isVisuallyEmpty(el));
    onChange(readValue(el));
  }, [onChange]);

  const saveSelection = useCallback(() => {
    const el = editorRef.current;
    const selection = window.getSelection();
    if (!el || !selection || selection.rangeCount === 0) return;
    const node = selection.anchorNode;
    if (!node || !el.contains(node)) return;
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }, []);

  const restoreSelection = useCallback(() => {
    const el = editorRef.current;
    const range = savedRangeRef.current;
    if (!el || !range) return;
    el.focus();
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const onMenuOpenChange = useCallback(
    (open: boolean) => {
      if (open) saveSelection();
    },
    [saveSelection],
  );

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
    (command: string, value?: string) => {
      if (disabled) return;
      restoreSelection();
      editorRef.current?.focus();
      // execCommand is deprecated but remains the only cross-browser way to do
      // inline rich-text formatting without pulling in a heavy editor library.
      if (typeof document.execCommand === "function") {
        document.execCommand(command, false, value);
      }
      emit();
    },
    [disabled, emit, restoreSelection],
  );

  const runToolbarButton = useCallback(
    (button: ToolbarButton) => {
      if (disabled) return;
      let value = button.value;
      if (button.prompt === "url") {
        const url = window.prompt("Enter a URL");
        if (!url) return;
        value = url;
      } else if (button.prompt === "image") {
        const url = window.prompt("Enter an image URL");
        if (!url) return;
        value = url;
      }
      runCommand(button.command, value);
    },
    [disabled, runCommand],
  );

  const insertEmoji = useCallback(
    (emoji: string) => {
      if (disabled) return;
      restoreSelection();
      editorRef.current?.focus();
      insertHtmlAtSelection(emoji);
      emit();
    },
    [disabled, emit, restoreSelection],
  );

  const applyFontSize = useCallback(
    (raw: number) => {
      if (disabled || Number.isNaN(raw)) return;
      const px = clampFontSizePx(raw);
      setFontSizePx(px);
      setFontSizeDraft(String(px));
      restoreSelection();
      editorRef.current?.focus();
      applyFontSizeToSelection(px);
      emit();
      setFontSizeOpen(false);
    },
    [disabled, emit, restoreSelection],
  );

  const onFontSizeOpenChange = useCallback(
    (open: boolean) => {
      onMenuOpenChange(open);
      setFontSizeOpen(open);
      if (open) setFontSizeDraft(String(fontSizePx));
    },
    [fontSizePx, onMenuOpenChange],
  );

  const applyTextColor = useCallback(
    (color: string) => {
      setTextColor(color);
      runCommand("foreColor", color);
      onMenuOpenChange(false);
      setTextColorOpen(false);
    },
    [onMenuOpenChange, runCommand],
  );

  const applyHighlightColor = useCallback(
    (color: string) => {
      setHighlightColor(color);
      restoreSelection();
      editorRef.current?.focus();
      if (typeof document.execCommand === "function") {
        const ok = document.execCommand("hiliteColor", false, color);
        if (!ok) document.execCommand("backColor", false, color);
      }
      emit();
      onMenuOpenChange(false);
      setHighlightOpen(false);
    },
    [emit, onMenuOpenChange, restoreSelection],
  );

  const onTextColorOpenChange = useCallback(
    (open: boolean) => {
      onMenuOpenChange(open);
      setTextColorOpen(open);
    },
    [onMenuOpenChange],
  );

  const onHighlightOpenChange = useCallback(
    (open: boolean) => {
      onMenuOpenChange(open);
      setHighlightOpen(open);
    },
    [onMenuOpenChange],
  );

  return (
    <div
      className={cn(
        "border-outline-variant/20 bg-surface-container-lowest/40 overflow-hidden rounded border",
        className,
      )}
    >
      <div
        className="border-outline-variant/10 bg-surface-container/60 flex flex-wrap items-center gap-1 border-b px-3 py-2"
        role="toolbar"
        aria-label="Formatting"
      >
        {toolbarStart && (
          <ToolbarGroup withDivider>{toolbarStart}</ToolbarGroup>
        )}

        <ToolbarGroup withDivider>
          {STYLE_BUTTONS.map((button) => (
            <ToolbarIconButton
              key={button.command}
              label={button.label}
              icon={button.icon}
              disabled={disabled}
              onClick={() => runToolbarButton(button)}
            />
          ))}
        </ToolbarGroup>

        <ToolbarGroup withDivider>
          <DropdownMenu onOpenChange={onMenuOpenChange}>
            <DropdownMenuTrigger asChild>
              <ToolbarMenuButton
                label="Font"
                text={font}
                textStyle={{ fontFamily: font }}
                disabled={disabled}
                className="min-w-[8.5rem] justify-between"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="z-[100] border-outline-variant/20 bg-surface-container-high text-on-surface"
            >
              {FONT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onSelect={() => {
                    setFont(option);
                    runCommand("fontName", option);
                  }}
                  style={{ fontFamily: option }}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover open={fontSizeOpen} onOpenChange={onFontSizeOpenChange}>
            <PopoverTrigger asChild>
              <ToolbarMenuButton
                label="Font size"
                text={`${fontSizePx}`}
                disabled={disabled}
              />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="z-[100] w-44 border-outline-variant/20 bg-surface-container-high p-2 text-on-surface"
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <form
                className="mb-2 flex items-center gap-1"
                onSubmit={(event) => {
                  event.preventDefault();
                  applyFontSize(Number(fontSizeDraft));
                }}
              >
                <Input
                  aria-label="Custom font size"
                  type="number"
                  min={MIN_FONT_SIZE_PX}
                  max={MAX_FONT_SIZE_PX}
                  value={fontSizeDraft}
                  onChange={(event) => setFontSizeDraft(event.target.value)}
                  className="h-8 border-outline-variant/30 bg-surface-container-lowest px-2 py-1 text-sm"
                />
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                  px
                </span>
                <Button
                  type="submit"
                  variant="ghost"
                  size="xs"
                  className="normal-case tracking-normal text-white"
                >
                  Apply
                </Button>
              </form>
              <ul className="max-h-48 space-y-0.5 overflow-auto">
                {FONT_SIZE_PRESETS.map((size) => (
                  <li key={size}>
                    <button
                      type="button"
                      aria-label={`${size} pixels`}
                      className={cn(
                        "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-surface-bright hover:text-white",
                        size === fontSizePx && "bg-surface-bright text-white",
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applyFontSize(size)}
                    >
                      <span style={{ fontSize: Math.min(size, 18) }}>{size}</span>
                      <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                        px
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <Popover open={textColorOpen} onOpenChange={onTextColorOpenChange}>
            <PopoverTrigger asChild>
              <ToolbarMenuButton
                label="Text color"
                icon="format_color_text"
                swatchColor={textColor}
                disabled={disabled}
              />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="z-[100] w-64 border-outline-variant/20 bg-surface-container-high p-3"
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <ColorPickerPanel
                labelPrefix="Text color"
                value={textColor}
                onChange={applyTextColor}
                onCancel={() => onTextColorOpenChange(false)}
              />
            </PopoverContent>
          </Popover>

          <Popover open={highlightOpen} onOpenChange={onHighlightOpenChange}>
            <PopoverTrigger asChild>
              <ToolbarMenuButton
                label="Highlight"
                icon="border_color"
                swatchColor={highlightColor}
                disabled={disabled}
              />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="z-[100] w-64 border-outline-variant/20 bg-surface-container-high p-3"
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <ColorPickerPanel
                labelPrefix="Highlight"
                value={highlightColor}
                onChange={applyHighlightColor}
                onCancel={() => onHighlightOpenChange(false)}
              />
            </PopoverContent>
          </Popover>
        </ToolbarGroup>

        <ToolbarGroup withDivider>
          <DropdownMenu onOpenChange={onMenuOpenChange}>
            <DropdownMenuTrigger asChild>
              <ToolbarMenuButton
                label="Align"
                icon="format_align_left"
                disabled={disabled}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="z-[100] border-outline-variant/20 bg-surface-container-high text-on-surface"
            >
              {ALIGN_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.command}
                  onSelect={() => runCommand(option.command)}
                >
                  <MaterialIcon name={option.icon} className="text-base" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {LIST_BUTTONS.map((button) => (
            <ToolbarIconButton
              key={button.command}
              label={button.label}
              icon={button.icon}
              disabled={disabled}
              onClick={() => runToolbarButton(button)}
            />
          ))}

          {INDENT_BUTTONS.map((button) => (
            <ToolbarIconButton
              key={button.command}
              label={button.label}
              icon={button.icon}
              disabled={disabled}
              onClick={() => runToolbarButton(button)}
            />
          ))}
        </ToolbarGroup>

        <ToolbarGroup withDivider>
          {INSERT_BUTTONS.map((button) => (
            <ToolbarIconButton
              key={button.label}
              label={button.label}
              icon={button.icon}
              disabled={disabled}
              onClick={() => runToolbarButton(button)}
            />
          ))}

          <Popover onOpenChange={onMenuOpenChange}>
            <PopoverTrigger asChild>
              <ToolbarMenuButton
                label="Emoji"
                icon="mood"
                disabled={disabled}
              />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="z-[100] w-auto border-outline-variant/20 bg-surface-container-high p-2"
            >
              <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`Insert ${emoji}`}
                    className="hover:bg-surface-variant size-8 rounded text-lg"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </ToolbarGroup>

        {toolbarEnd}
      </div>

      <div className="relative">
        {isEmpty && (
          <p
            aria-hidden="true"
            className="text-outline-variant/60 pointer-events-none absolute top-3 left-4 text-sm italic"
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
            "min-h-40 w-full px-4 py-3 text-sm leading-relaxed text-white focus:outline-none",
            "[&_a]:text-primary [&_a]:underline",
            "[&_blockquote]:border-outline-variant/40 [&_blockquote]:text-on-surface-variant [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:pl-3",
            "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
            "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
            "[&_img]:max-w-full [&_img]:rounded",
            disabled && "opacity-60",
          )}
        />
      </div>
    </div>
  );
});

export type { RichTextEditorProps };
