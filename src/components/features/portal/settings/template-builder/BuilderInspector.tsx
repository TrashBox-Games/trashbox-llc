"use client";

import { useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import {
  BLOCK_TYPE_LABELS,
  BUTTON_FONT_FAMILIES,
  COLUMN_LIMITS,
  DEFAULT_BOX_CHROME,
  DEFAULT_IMAGE_STYLE,
  DEFAULT_LAYOUT_CHROME,
  equalColumnWidths,
  equalTrackSizes,
  GRID_LIMITS,
  gridCellIndex,
  normalizeColumnWidths,
  normalizeTrackSizes,
  parseBackgroundPosition,
  parseBackgroundSize,
  parseColumnItems,
  parseImageAlign,
  parseImageFit,
  serializeColumnItems,
  type BackgroundPosition,
  type BackgroundSize,
  type BoxChromeFields,
  type CellVerticalAlign,
  type ColumnItem,
  type EmailTemplateBlock,
  type EmailTemplateButtonBlock,
  type EmailTemplateColumnsBlock,
  type EmailTemplateDocument,
  type EmailTemplateGridBlock,
  type EmailTemplateImageBlock,
  type EmailTemplatePageBand,
  type EmailTemplateTableBlock,
  type ImageFitMode,
  type ImageTextImageChild,
  type LayoutAlign,
} from "@/lib/email-template-document";
import {
  getAlphaPercent,
  setColorAlpha,
  setColorRgb,
  toOpaqueHex,
  toRgbHexDisplay,
} from "@/lib/color";
import { cn } from "@/lib/utils";

export interface BuilderInspectorProps {
  block: EmailTemplateBlock | null;
  /** Nested item inside a columns block, when selected. */
  selectedColumnItem?: ColumnItem | null;
  /** Selected column container index (hierarchy). */
  selectedColumnIndex?: number | null;
  selectedGridCell?: { rowIndex: number; columnIndex: number } | null;
  selectedImageTextChild?: "image" | "text" | null;
  /** Header or footer chrome band selection. */
  selectedPageBand?: "header" | "footer" | null;
  pageBand?: EmailTemplatePageBand | null;
  document?: EmailTemplateDocument | null;
  onChange: (patch: Partial<EmailTemplateBlock>) => void;
  onChangeColumnItem?: (patch: Partial<ColumnItem>) => void;
  onChangeImageTextImage?: (patch: Partial<ImageTextImageChild>) => void;
  onChangePageBand?: (patch: Partial<EmailTemplatePageBand>) => void;
  onRemovePageBand?: () => void;
  onChangeDocument?: (patch: Partial<EmailTemplateDocument>) => void;
  className?: string;
}

const inputSurface =
  "h-7 w-full rounded-[4px] border-0 bg-[#383838] text-[11px] leading-none text-[#f5f5f5] outline-none placeholder:text-[#8c8c8c] focus:ring-1 focus:ring-[#0d99ff]";

/** Keep digits only; empty → "0"; strip leading zeros so "04" becomes "4". */
function sanitizeIntegerInput(raw: string): string {
  if (raw.trim() === "") return "0";
  let cleaned = raw.replace(/[^\d]/g, "");
  if (cleaned === "") return "0";
  if (cleaned.length > 1) cleaned = cleaned.replace(/^0+/, "") || "0";
  return cleaned;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function EditableNumberInput({
  id,
  value,
  min,
  max,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
  "aria-label"?: string;
}): React.ReactElement {
  const focusedRef = useRef(false);
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    if (!focusedRef.current) {
      setText(String(value));
    }
  }, [value]);

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      aria-label={ariaLabel}
      value={text}
      onFocus={() => {
        focusedRef.current = true;
      }}
      onBlur={() => {
        focusedRef.current = false;
        const clamped = clampNumber(Number(text), min, max);
        setText(String(clamped));
        onChange(clamped);
      }}
      onChange={(event) => {
        const next = sanitizeIntegerInput(event.target.value);
        setText(next);
        onChange(clampNumber(Number(next), min, max));
      }}
      className={className}
    />
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="border-b border-[#444]">
      <div className="flex h-8 items-center px-3">
        <h3 className="text-[11px] font-semibold text-[#f5f5f5]">{title}</h3>
      </div>
      {children ? <div className="space-y-2.5 px-3 pb-3">{children}</div> : null}
    </section>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-[10px] font-medium text-[#8c8c8c]"
    >
      {children}
    </label>
  );
}

function FieldIcon({
  icon,
  badge,
}: {
  icon?: string;
  badge?: string;
}): React.ReactElement {
  return (
    <span className="pointer-events-none absolute top-0 left-0 flex h-7 w-7 items-center justify-center text-[#8c8c8c]">
      {icon ? (
        <MaterialIcon name={icon} className="text-[14px]" />
      ) : (
        <span className="text-[10px] font-medium">{badge}</span>
      )}
    </span>
  );
}

function NumberField({
  id,
  label,
  ariaLabel,
  badge,
  icon,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  ariaLabel?: string;
  badge?: string;
  icon?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}): React.ReactElement {
  return (
    <div className="min-w-0">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <FieldIcon icon={icon} badge={badge} />
        <EditableNumberInput
          id={id}
          value={value}
          min={min}
          max={max}
          onChange={onChange}
          aria-label={ariaLabel ?? label}
          className={cn(inputSurface, "pr-2 pl-7")}
        />
        {suffix ? (
          <span className="pointer-events-none absolute top-0 right-2 flex h-7 items-center text-[10px] text-[#8c8c8c]">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  icon,
  badge,
  value,
  onChange,
  children,
  style,
}: {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}): React.ReactElement {
  return (
    <div className="min-w-0">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <FieldIcon icon={icon} badge={badge} />
        <select
          id={id}
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputSurface, "appearance-none pr-6 pl-7")}
          style={style}
        >
          {children}
        </select>
        <MaterialIcon
          name="expand_more"
          className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-base text-[#8c8c8c]"
        />
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  icon?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}): React.ReactElement {
  return (
    <div className="min-w-0">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        {icon ? <FieldIcon icon={icon} /> : null}
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          aria-label={label}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputSurface, icon ? "px-2 pl-7" : "px-2")}
        />
      </div>
    </div>
  );
}

function fromHexInput(value: string, current: string): string {
  const cleaned = value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
  if (cleaned.length === 3) {
    const expanded = cleaned
      .split("")
      .map((ch) => ch + ch)
      .join("");
    return setColorRgb(current, `#${expanded}`);
  }
  if (cleaned.length === 6) {
    return setColorRgb(current, `#${cleaned}`);
  }
  return current;
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  const opaque = toOpaqueHex(value);

  return (
    <div className="min-w-0">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={id}
          className="relative h-7 w-7 shrink-0 overflow-hidden rounded-[4px] border border-[#555]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #bbb 25%, transparent 25%), linear-gradient(-45deg, #bbb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #bbb 75%), linear-gradient(-45deg, transparent 75%, #bbb 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
          }}
        >
          <span
            className="absolute inset-0"
            style={{ backgroundColor: value }}
            aria-hidden
          />
          <input
            id={id}
            type="color"
            value={opaque}
            onChange={(event) => onChange(setColorRgb(value, event.target.value))}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={label}
          />
        </label>
        <div className="relative min-w-0 flex-1">
          <FieldIcon icon="tag" />
          <input
            value={toRgbHexDisplay(value)}
            onChange={(event) => onChange(fromHexInput(event.target.value, value))}
            className={cn(inputSurface, "pl-7 font-mono uppercase")}
            aria-label={`${label} hex`}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

function OpacityField({
  id,
  label,
  ariaLabel,
  value,
  onChange,
}: {
  id: string;
  label: string;
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  const alpha = getAlphaPercent(value);
  return (
    <NumberField
      id={id}
      label={label}
      ariaLabel={ariaLabel ?? label}
      icon="opacity"
      value={alpha}
      min={0}
      max={100}
      suffix="%"
      onChange={(next) => onChange(setColorAlpha(value, next))}
    />
  );
}

function AlignButtons({
  value,
  onChange,
  groupLabel = "Alignment",
}: {
  value: "left" | "center" | "right";
  onChange: (value: "left" | "center" | "right") => void;
  groupLabel?: string;
}): React.ReactElement {
  const options: {
    value: "left" | "center" | "right";
    icon: string;
    label: string;
  }[] = [
    { value: "left", icon: "format_align_left", label: "Align left" },
    { value: "center", icon: "format_align_center", label: "Align center" },
    { value: "right", icon: "format_align_right", label: "Align right" },
  ];
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[10px] font-medium text-[#8c8c8c]">Alignment</p>
      <div className="flex gap-0.5" role="group" aria-label={groupLabel}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-7 flex-1 items-center justify-center rounded-[4px] text-[#c7c7c7]",
              value === option.value
                ? "bg-[#4a4a4a] text-white"
                : "hover:bg-[#383838]",
            )}
          >
            <MaterialIcon name={option.icon} className="text-base" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ButtonInspector({
  block,
  onChange,
}: {
  block: EmailTemplateButtonBlock;
  onChange: (patch: Partial<EmailTemplateButtonBlock>) => void;
}): React.ReactElement {
  return (
    <>
      <Section title="Content">
        <TextField
          id={`inspect-btn-label-${block.id}`}
          label="Label"
          icon="title"
          value={block.label}
          onChange={(label) => onChange({ label })}
        />
        <TextField
          id={`inspect-btn-href-${block.id}`}
          label="Link URL"
          icon="link"
          value={block.href}
          onChange={(href) => onChange({ href })}
          placeholder="https://"
        />
        <AlignButtons
          groupLabel="Button alignment"
          value={block.align}
          onChange={(align) => onChange({ align })}
        />
      </Section>

      <Section title="Layout">
        <NumberField
          id={`inspect-btn-radius-${block.id}`}
          label="Corner radius"
          icon="rounded_corner"
          value={block.borderRadius}
          min={0}
          max={64}
          onChange={(borderRadius) => onChange({ borderRadius })}
        />
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            id={`inspect-btn-pad-x-${block.id}`}
            label="Pad width"
            badge="W"
            value={block.paddingX}
            min={0}
            max={80}
            onChange={(paddingX) => onChange({ paddingX })}
          />
          <NumberField
            id={`inspect-btn-pad-y-${block.id}`}
            label="Pad height"
            badge="H"
            value={block.paddingY}
            min={0}
            max={80}
            onChange={(paddingY) => onChange({ paddingY })}
          />
        </div>
        <SizeFields
          idPrefix={`inspect-btn-size-${block.id}`}
          width={block.width}
          height={block.height}
          onChange={onChange}
        />
      </Section>

      <Section title="Fill">
        <ColorField
          id={`inspect-btn-fill-${block.id}`}
          label="Fill"
          value={block.backgroundColor}
          onChange={(backgroundColor) => onChange({ backgroundColor })}
        />
        <OpacityField
          id={`inspect-btn-opacity-${block.id}`}
          label="Opacity"
          ariaLabel="Fill opacity"
          value={block.backgroundColor}
          onChange={(backgroundColor) => onChange({ backgroundColor })}
        />
      </Section>

      <Section title="Typography">
        <SelectField
          id={`inspect-btn-font-${block.id}`}
          label="Font"
          icon="font_download"
          value={block.fontFamily}
          onChange={(fontFamily) => onChange({ fontFamily })}
          style={{ fontFamily: block.fontFamily }}
        >
          {BUTTON_FONT_FAMILIES.map((font) => (
            <option
              key={font.value}
              value={font.value}
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </option>
          ))}
        </SelectField>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            id={`inspect-btn-font-size-${block.id}`}
            label="Size"
            badge="Aa"
            value={block.fontSize}
            min={8}
            max={72}
            onChange={(fontSize) => onChange({ fontSize })}
          />
          <SelectField
            id={`inspect-btn-font-weight-${block.id}`}
            label="Weight"
            icon="format_bold"
            value={block.fontWeight}
            onChange={(fontWeight) =>
              onChange({
                fontWeight:
                  fontWeight as EmailTemplateButtonBlock["fontWeight"],
              })
            }
          >
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semibold</option>
            <option value="700">Bold</option>
          </SelectField>
        </div>
        <ColorField
          id={`inspect-btn-text-${block.id}`}
          label="Text color"
          value={block.textColor}
          onChange={(textColor) => onChange({ textColor })}
        />
        <OpacityField
          id={`inspect-btn-text-opacity-${block.id}`}
          label="Opacity"
          ariaLabel="Text opacity"
          value={block.textColor}
          onChange={(textColor) => onChange({ textColor })}
        />
      </Section>

      <Section title="Stroke">
        <NumberField
          id={`inspect-btn-border-w-${block.id}`}
          label="Stroke width"
          badge="W"
          value={block.borderWidth}
          min={0}
          max={12}
          onChange={(borderWidth) => onChange({ borderWidth })}
        />
        <ColorField
          id={`inspect-btn-border-c-${block.id}`}
          label="Stroke color"
          value={block.borderColor}
          onChange={(borderColor) => onChange({ borderColor })}
        />
      </Section>
    </>
  );
}

function SizeFields({
  idPrefix,
  width,
  height,
  onChange,
}: {
  idPrefix: string;
  width: number | null;
  height: number | null;
  onChange: (patch: { width?: number | null; height?: number | null }) => void;
}): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-2">
      <NumberField
        id={`${idPrefix}-w`}
        label="Width"
        badge="W"
        value={width ?? 0}
        min={0}
        max={600}
        suffix="px"
        onChange={(value) => onChange({ width: value <= 0 ? null : value })}
      />
      <NumberField
        id={`${idPrefix}-h`}
        label="Height"
        badge="H"
        value={height ?? 0}
        min={0}
        max={1200}
        suffix="px"
        onChange={(value) => onChange({ height: value <= 0 ? null : value })}
      />
    </div>
  );
}

function BoxChromeFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: BoxChromeFields;
  onChange: (patch: Partial<BoxChromeFields>) => void;
}): React.ReactElement {
  return (
    <Section title="Chrome">
      <ColorField
        id={`${idPrefix}-bg`}
        label="Background"
        value={value.backgroundColor || DEFAULT_BOX_CHROME.backgroundColor}
        onChange={(backgroundColor) => onChange({ backgroundColor })}
      />
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          id={`${idPrefix}-border-w`}
          label="Border"
          badge="B"
          value={value.borderWidth}
          min={0}
          max={12}
          suffix="px"
          onChange={(borderWidth) => onChange({ borderWidth })}
        />
        <NumberField
          id={`${idPrefix}-radius`}
          label="Radius"
          badge="R"
          value={value.borderRadius}
          min={0}
          max={64}
          suffix="px"
          onChange={(borderRadius) => onChange({ borderRadius })}
        />
      </div>
      <ColorField
        id={`${idPrefix}-border-color`}
        label="Border color"
        value={value.borderColor || DEFAULT_BOX_CHROME.borderColor}
        onChange={(borderColor) => onChange({ borderColor })}
      />
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          id={`${idPrefix}-pad-x`}
          label="Pad width"
          badge="W"
          value={value.paddingX}
          min={0}
          max={80}
          suffix="px"
          onChange={(paddingX) => onChange({ paddingX })}
        />
        <NumberField
          id={`${idPrefix}-pad-y`}
          label="Pad height"
          badge="H"
          value={value.paddingY}
          min={0}
          max={80}
          suffix="px"
          onChange={(paddingY) => onChange({ paddingY })}
        />
      </div>
    </Section>
  );
}

function LayoutChromeFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: {
    backgroundColor: string;
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
    paddingX: number;
    paddingY: number;
    align: LayoutAlign;
    cellPadding: number;
    cellVerticalAlign: CellVerticalAlign;
  };
  onChange: (
    patch: Partial<{
      backgroundColor: string;
      borderWidth: number;
      borderColor: string;
      borderRadius: number;
      paddingX: number;
      paddingY: number;
      align: LayoutAlign;
      cellPadding: number;
      cellVerticalAlign: CellVerticalAlign;
    }>,
  ) => void;
}): React.ReactElement {
  return (
    <>
      <BoxChromeFields
        idPrefix={idPrefix}
        value={{
          backgroundColor: value.backgroundColor,
          borderWidth: value.borderWidth,
          borderColor: value.borderColor,
          borderRadius: value.borderRadius,
          paddingX: value.paddingX,
          paddingY: value.paddingY,
        }}
        onChange={onChange}
      />
      <Section title="Alignment">
        <SelectField
          id={`${idPrefix}-align`}
          label="Block align"
          icon="format_align_left"
          value={value.align}
          onChange={(align) => onChange({ align: align as LayoutAlign })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </SelectField>
        <SelectField
          id={`${idPrefix}-valign`}
          label="Cell vertical align"
          icon="vertical_align_top"
          value={value.cellVerticalAlign}
          onChange={(cellVerticalAlign) =>
            onChange({
              cellVerticalAlign: cellVerticalAlign as CellVerticalAlign,
            })
          }
        >
          <option value="top">Top</option>
          <option value="middle">Middle</option>
          <option value="bottom">Bottom</option>
        </SelectField>
        <NumberField
          id={`${idPrefix}-cell-pad`}
          label="Cell padding"
          badge="P"
          value={value.cellPadding}
          min={0}
          max={80}
          suffix="px"
          onChange={(cellPadding) => onChange({ cellPadding })}
        />
      </Section>
    </>
  );
}

function ColumnsInspector({
  block,
  onChange,
  focusColumnIndex,
}: {
  block: EmailTemplateColumnsBlock;
  onChange: (patch: Partial<EmailTemplateColumnsBlock>) => void;
  focusColumnIndex?: number | null;
}): React.ReactElement {
  void focusColumnIndex;
  return (
    <>
      <LayoutChromeFields
        idPrefix={`inspect-col-chrome-${block.id}`}
        value={{
          backgroundColor: block.backgroundColor ?? DEFAULT_LAYOUT_CHROME.backgroundColor,
          borderWidth: block.borderWidth ?? 0,
          borderColor: block.borderColor ?? DEFAULT_LAYOUT_CHROME.borderColor,
          borderRadius: block.borderRadius ?? 0,
          paddingX: block.paddingX ?? DEFAULT_LAYOUT_CHROME.paddingX,
          paddingY: block.paddingY ?? DEFAULT_LAYOUT_CHROME.paddingY,
          align: block.align ?? "left",
          cellPadding: block.cellPadding ?? 0,
          cellVerticalAlign: block.cellVerticalAlign ?? "top",
        }}
        onChange={(patch) => onChange(patch)}
      />
      <Section title="Layout">
        <NumberField
          id={`inspect-col-count-${block.id}`}
          label="Column count"
          badge="C"
          value={block.columns.length}
          min={COLUMN_LIMITS.minColumns}
          max={COLUMN_LIMITS.maxColumns}
          onChange={(count) => {
            const clamped = Math.min(
              COLUMN_LIMITS.maxColumns,
              Math.max(COLUMN_LIMITS.minColumns, count),
            );
            onChange({
              columns: Array.from(
                { length: clamped },
                (_, index) => block.columns[index] ?? "<p><br /></p>",
              ),
              columnWidths:
                block.columnWidths == null
                  ? null
                  : normalizeColumnWidths(block.columnWidths, clamped),
            });
          }}
        />
        <SelectField
          id={`inspect-col-widths-mode-${block.id}`}
          label="Column widths"
          badge="W"
          value={block.columnWidths == null ? "auto" : "custom"}
          onChange={(mode) => {
            onChange({
              columnWidths:
                mode === "auto"
                  ? null
                  : equalColumnWidths(block.columns.length),
            });
          }}
        >
          <option value="auto">Auto</option>
          <option value="custom">Custom</option>
        </SelectField>
        {block.columnWidths != null ? (
          <div
            data-testid="column-widths-custom"
            className="space-y-0 overflow-hidden rounded border border-[#444]"
          >
            {normalizeColumnWidths(
              block.columnWidths,
              block.columns.length,
            ).map((width, index) => {
              const id = `inspect-col-width-${block.id}-${index}`;
              const value =
                block.columnWidths?.[index] != null
                  ? Math.max(
                      1,
                      Math.min(99, Math.round(block.columnWidths[index]!)),
                    )
                  : width;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 border-b border-[#444] px-2 py-0 last:border-b-0"
                >
                  <label
                    htmlFor={id}
                    className="w-16 shrink-0 text-[10px] font-medium text-[#8c8c8c]"
                  >
                    Col {index + 1}
                  </label>
                  <div className="relative min-w-0 flex-1">
                    <span className="pointer-events-none absolute top-0 left-0 flex h-7 w-7 items-center justify-center text-[10px] font-medium text-[#8c8c8c]">
                      %
                    </span>
                    <EditableNumberInput
                      id={id}
                      value={value}
                      min={1}
                      max={99}
                      aria-label={`Column ${index + 1} width`}
                      className={cn(inputSurface, "pr-2 pl-7")}
                      onChange={(nextWidth) => {
                        const count = block.columns.length;
                        const current =
                          block.columnWidths?.length === count
                            ? block.columnWidths.map((entry) =>
                                Number.isFinite(entry)
                                  ? Math.max(1, Math.min(99, Math.round(entry)))
                                  : 1,
                              )
                            : normalizeColumnWidths(
                                block.columnWidths,
                                count,
                              );
                        const widths = current.map((entry, i) =>
                          i === index ? nextWidth : entry,
                        );
                        onChange({ columnWidths: widths });
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        <NumberField
          id={`inspect-col-gap-${block.id}`}
          label="Gap"
          badge="G"
          value={block.columnGap ?? 24}
          min={0}
          max={200}
          suffix="px"
          onChange={(columnGap) => {
            onChange({
              columnGap: Math.min(200, Math.max(0, Math.round(columnGap))),
            });
          }}
        />
        <NumberField
          id={`inspect-col-item-gap-${block.id}`}
          label="Item spacing"
          badge="S"
          value={block.itemGap ?? 12}
          min={0}
          max={200}
          suffix="px"
          onChange={(itemGap) => {
            const nextGap = Math.min(200, Math.max(0, Math.round(itemGap)));
            const columns = block.columns.map((html) =>
              serializeColumnItems(parseColumnItems(html), nextGap),
            );
            onChange({ itemGap: nextGap, columns });
          }}
        />
        <SizeFields
          idPrefix={`inspect-col-size-${block.id}`}
          width={block.width}
          height={block.height}
          onChange={onChange}
        />
        <p className="text-[10px] leading-relaxed text-[#8c8c8c]">
          Column widths default to Auto (even split). Choose Custom to set each
          column’s percentage. Gap is the space between columns.
        </p>
      </Section>

      {block.columns.map((html, colIndex) => {
        const items = parseColumnItems(html);
        if (items.length < 2) return null;
        return (
          <Section key={colIndex} title={`Column ${colIndex + 1} gaps`}>
            {items.slice(1).map((item, offset) => {
              const itemIndex = offset + 1;
              return (
                <NumberField
                  key={`${colIndex}-${itemIndex}`}
                  id={`inspect-col-${block.id}-${colIndex}-gap-${itemIndex}`}
                  label={`Gap before item ${itemIndex + 1}`}
                  badge="G"
                  value={item.gapBefore ?? block.itemGap ?? 12}
                  min={0}
                  max={200}
                  suffix="px"
                  onChange={(gapBefore) => {
                    const nextItems = parseColumnItems(
                      block.columns[colIndex] ?? "",
                    );
                    nextItems[itemIndex] = {
                      ...nextItems[itemIndex]!,
                      gapBefore,
                    };
                    const columns = [...block.columns];
                    columns[colIndex] = serializeColumnItems(
                      nextItems,
                      block.itemGap ?? 12,
                    );
                    onChange({ columns });
                  }}
                />
              );
            })}
          </Section>
        );
      })}
    </>
  );
}

function GridInspector({
  block,
  onChange,
}: {
  block: EmailTemplateGridBlock;
  onChange: (patch: Partial<EmailTemplateGridBlock>) => void;
}): React.ReactElement {
  const rows = block.rows;
  const cols = block.columns;

  function resize(nextRows: number, nextCols: number) {
    const clampedRows = Math.min(
      GRID_LIMITS.maxRows,
      Math.max(GRID_LIMITS.minRows, nextRows),
    );
    const clampedCols = Math.min(
      GRID_LIMITS.maxColumns,
      Math.max(GRID_LIMITS.minColumns, nextCols),
    );
    const cells = Array.from(
      { length: clampedRows * clampedCols },
      () => "<p><br /></p>",
    );
    for (let row = 0; row < Math.min(rows, clampedRows); row += 1) {
      for (let col = 0; col < Math.min(cols, clampedCols); col += 1) {
        cells[gridCellIndex(row, col, clampedCols)] =
          block.cells[gridCellIndex(row, col, cols)] ?? "<p><br /></p>";
      }
    }
    onChange({
      rows: clampedRows,
      columns: clampedCols,
      cells,
      columnWidths:
        block.columnWidths == null
          ? null
          : normalizeTrackSizes(block.columnWidths, clampedCols),
      rowHeights:
        block.rowHeights == null
          ? null
          : normalizeTrackSizes(block.rowHeights, clampedRows),
    });
  }

  return (
    <>
      <LayoutChromeFields
        idPrefix={`inspect-grid-chrome-${block.id}`}
        value={{
          backgroundColor: block.backgroundColor ?? DEFAULT_LAYOUT_CHROME.backgroundColor,
          borderWidth: block.borderWidth ?? 0,
          borderColor: block.borderColor ?? DEFAULT_LAYOUT_CHROME.borderColor,
          borderRadius: block.borderRadius ?? 0,
          paddingX: block.paddingX ?? 0,
          paddingY: block.paddingY ?? 0,
          align: block.align ?? "left",
          cellPadding: block.cellPadding ?? 0,
          cellVerticalAlign: block.cellVerticalAlign ?? "top",
        }}
        onChange={(patch) => onChange(patch)}
      />
      <Section title="Layout">
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            id={`inspect-grid-rows-${block.id}`}
            label="Rows"
            badge="R"
            value={rows}
            min={GRID_LIMITS.minRows}
            max={GRID_LIMITS.maxRows}
            onChange={(value) => resize(value, cols)}
          />
          <NumberField
            id={`inspect-grid-cols-${block.id}`}
            label="Columns"
            badge="C"
            value={cols}
            min={GRID_LIMITS.minColumns}
            max={GRID_LIMITS.maxColumns}
            onChange={(value) => resize(rows, value)}
          />
        </div>
        <SelectField
          id={`inspect-grid-widths-mode-${block.id}`}
          label="Column widths"
          badge="W"
          value={block.columnWidths == null ? "auto" : "custom"}
          onChange={(mode) => {
            onChange({
              columnWidths:
                mode === "auto" ? null : equalTrackSizes(block.columns),
            });
          }}
        >
          <option value="auto">Auto</option>
          <option value="custom">Custom</option>
        </SelectField>
        {block.columnWidths != null ? (
          <div
            data-testid="grid-column-widths-custom"
            className="space-y-0 overflow-hidden rounded border border-[#444]"
          >
            {normalizeTrackSizes(block.columnWidths, cols).map(
              (width, index) => {
                const id = `inspect-grid-col-width-${block.id}-${index}`;
                const value =
                  block.columnWidths?.[index] != null
                    ? Math.max(
                        1,
                        Math.min(99, Math.round(block.columnWidths[index]!)),
                      )
                    : width;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 border-b border-[#444] px-2 py-0 last:border-b-0"
                  >
                    <label
                      htmlFor={id}
                      className="w-16 shrink-0 text-[10px] font-medium text-[#8c8c8c]"
                    >
                      Col {index + 1}
                    </label>
                    <div className="relative min-w-0 flex-1">
                      <span className="pointer-events-none absolute top-0 left-0 flex h-7 w-7 items-center justify-center text-[10px] font-medium text-[#8c8c8c]">
                        %
                      </span>
                      <EditableNumberInput
                        id={id}
                        value={value}
                        min={1}
                        max={99}
                        aria-label={`Grid column ${index + 1} width`}
                        className={cn(inputSurface, "pr-2 pl-7")}
                        onChange={(nextWidth) => {
                          const current =
                            block.columnWidths?.length === cols
                              ? block.columnWidths.map((entry) =>
                                  Number.isFinite(entry)
                                    ? Math.max(
                                        1,
                                        Math.min(99, Math.round(entry)),
                                      )
                                    : 1,
                                )
                              : normalizeTrackSizes(block.columnWidths, cols);
                          const widths = current.map((entry, i) =>
                            i === index ? nextWidth : entry,
                          );
                          onChange({ columnWidths: widths });
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ) : null}
        <SelectField
          id={`inspect-grid-heights-mode-${block.id}`}
          label="Row heights"
          badge="H"
          value={block.rowHeights == null ? "auto" : "custom"}
          onChange={(mode) => {
            onChange({
              rowHeights: mode === "auto" ? null : equalTrackSizes(block.rows),
            });
          }}
        >
          <option value="auto">Auto</option>
          <option value="custom">Custom</option>
        </SelectField>
        {block.rowHeights != null ? (
          <div
            data-testid="grid-row-heights-custom"
            className="space-y-0 overflow-hidden rounded border border-[#444]"
          >
            {normalizeTrackSizes(block.rowHeights, rows).map(
              (height, index) => {
                const id = `inspect-grid-row-height-${block.id}-${index}`;
                const value =
                  block.rowHeights?.[index] != null
                    ? Math.max(
                        1,
                        Math.min(99, Math.round(block.rowHeights[index]!)),
                      )
                    : height;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 border-b border-[#444] px-2 py-0 last:border-b-0"
                  >
                    <label
                      htmlFor={id}
                      className="w-16 shrink-0 text-[10px] font-medium text-[#8c8c8c]"
                    >
                      Row {index + 1}
                    </label>
                    <div className="relative min-w-0 flex-1">
                      <span className="pointer-events-none absolute top-0 left-0 flex h-7 w-7 items-center justify-center text-[10px] font-medium text-[#8c8c8c]">
                        %
                      </span>
                      <EditableNumberInput
                        id={id}
                        value={value}
                        min={1}
                        max={99}
                        aria-label={`Grid row ${index + 1} height`}
                        className={cn(inputSurface, "pr-2 pl-7")}
                        onChange={(nextHeight) => {
                          const current =
                            block.rowHeights?.length === rows
                              ? block.rowHeights.map((entry) =>
                                  Number.isFinite(entry)
                                    ? Math.max(
                                        1,
                                        Math.min(99, Math.round(entry)),
                                      )
                                    : 1,
                                )
                              : normalizeTrackSizes(block.rowHeights, rows);
                          const heights = current.map((entry, i) =>
                            i === index ? nextHeight : entry,
                          );
                          onChange({ rowHeights: heights });
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ) : null}
        <NumberField
          id={`inspect-grid-col-gap-${block.id}`}
          label="Column gap"
          badge="G"
          value={block.columnGap ?? 16}
          min={0}
          max={200}
          suffix="px"
          onChange={(columnGap) => {
            onChange({
              columnGap: Math.min(200, Math.max(0, Math.round(columnGap))),
            });
          }}
        />
        <NumberField
          id={`inspect-grid-row-gap-${block.id}`}
          label="Row gap"
          badge="G"
          value={block.rowGap ?? 16}
          min={0}
          max={200}
          suffix="px"
          onChange={(rowGap) => {
            onChange({
              rowGap: Math.min(200, Math.max(0, Math.round(rowGap))),
            });
          }}
        />
        <NumberField
          id={`inspect-grid-item-gap-${block.id}`}
          label="Item spacing"
          badge="S"
          value={block.itemGap ?? 12}
          min={0}
          max={200}
          suffix="px"
          onChange={(itemGap) => {
            const nextGap = Math.min(200, Math.max(0, Math.round(itemGap)));
            const cells = block.cells.map((html) =>
              serializeColumnItems(parseColumnItems(html), nextGap),
            );
            onChange({ itemGap: nextGap, cells });
          }}
        />
        <SizeFields
          idPrefix={`inspect-grid-size-${block.id}`}
          width={block.width}
          height={block.height}
          onChange={onChange}
        />
        <p className="text-[10px] leading-relaxed text-[#8c8c8c]">
          Column widths and row heights default to Auto. Choose Custom to set
          percentages. Gaps space cells; item spacing stacks content inside a
          cell.
        </p>
      </Section>

      {Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: cols }, (_, colIndex) => {
          const flat = gridCellIndex(rowIndex, colIndex, cols);
          const items = parseColumnItems(block.cells[flat] ?? "");
          if (items.length < 2) return null;
          return (
            <Section
              key={`${rowIndex}-${colIndex}`}
              title={`Cell ${rowIndex + 1},${colIndex + 1} gaps`}
            >
              {items.slice(1).map((item, offset) => {
                const itemIndex = offset + 1;
                return (
                  <NumberField
                    key={`${rowIndex}-${colIndex}-${itemIndex}`}
                    id={`inspect-grid-${block.id}-${rowIndex}-${colIndex}-gap-${itemIndex}`}
                    label={`Gap before item ${itemIndex + 1}`}
                    badge="G"
                    value={item.gapBefore ?? block.itemGap ?? 12}
                    min={0}
                    max={200}
                    suffix="px"
                    onChange={(gapBefore) => {
                      const nextItems = parseColumnItems(
                        block.cells[flat] ?? "",
                      );
                      nextItems[itemIndex] = {
                        ...nextItems[itemIndex]!,
                        gapBefore,
                      };
                      const cells = [...block.cells];
                      cells[flat] = serializeColumnItems(
                        nextItems,
                        block.itemGap ?? 12,
                      );
                      onChange({ cells });
                    }}
                  />
                );
              })}
            </Section>
          );
        }),
      )}
    </>
  );
}

function TableInspector({
  block,
  onChange,
}: {
  block: EmailTemplateTableBlock;
  onChange: (patch: Partial<EmailTemplateTableBlock>) => void;
}): React.ReactElement {
  const rowCount = block.rows.length;
  const columnCount = block.rows[0]?.length ?? 1;

  function resize(nextRows: number, nextCols: number) {
    const rows = Array.from({ length: nextRows }, (_, rowIndex) => {
      const source = block.rows[rowIndex] ?? [];
      return Array.from({ length: nextCols }, (_, colIndex) => {
        if (source[colIndex] != null) return source[colIndex]!;
        if (rowIndex === 0) return `Header ${colIndex + 1}`;
        return "Cell";
      });
    });
    onChange({ rows });
  }

  return (
    <>
      <BoxChromeFields
        idPrefix={`inspect-table-chrome-${block.id}`}
        value={block.boxChrome ?? { ...DEFAULT_BOX_CHROME }}
        onChange={(patch) =>
          onChange({
            boxChrome: {
              ...(block.boxChrome ?? { ...DEFAULT_BOX_CHROME }),
              ...patch,
            },
          })
        }
      />
      <Section title="Grid">
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            id={`inspect-table-rows-${block.id}`}
            label="Rows"
            badge="R"
            value={rowCount}
            min={1}
            max={12}
            onChange={(value) => resize(value, columnCount)}
          />
          <NumberField
            id={`inspect-table-cols-${block.id}`}
            label="Columns"
            badge="C"
            value={columnCount}
            min={1}
            max={8}
            onChange={(value) => resize(rowCount, value)}
          />
        </div>
        <NumberField
          id={`inspect-table-pad-${block.id}`}
          label="Cell padding"
          badge="P"
          value={block.cellPadding}
          min={0}
          max={40}
          onChange={(cellPadding) => onChange({ cellPadding })}
        />
        <SizeFields
          idPrefix={`inspect-table-size-${block.id}`}
          width={block.width}
          height={block.height}
          onChange={onChange}
        />
      </Section>

      <Section title="Header">
        <ColorField
          id={`inspect-table-header-bg-${block.id}`}
          label="Header fill"
          value={block.headerBackgroundColor}
          onChange={(headerBackgroundColor) =>
            onChange({ headerBackgroundColor })
          }
        />
        <ColorField
          id={`inspect-table-header-fg-${block.id}`}
          label="Header text"
          value={block.headerTextColor}
          onChange={(headerTextColor) => onChange({ headerTextColor })}
        />
        <SelectField
          id={`inspect-table-header-weight-${block.id}`}
          label="Header weight"
          badge="W"
          value={block.headerFontWeight}
          onChange={(headerFontWeight) =>
            onChange({
              headerFontWeight:
                headerFontWeight as EmailTemplateTableBlock["headerFontWeight"],
            })
          }
        >
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="600">Semibold</option>
          <option value="700">Bold</option>
        </SelectField>
      </Section>

      <Section title="Cells">
        <ColorField
          id={`inspect-table-cell-bg-${block.id}`}
          label="Cell fill"
          value={block.cellBackgroundColor}
          onChange={(cellBackgroundColor) => onChange({ cellBackgroundColor })}
        />
        <ColorField
          id={`inspect-table-cell-fg-${block.id}`}
          label="Cell text"
          value={block.cellTextColor}
          onChange={(cellTextColor) => onChange({ cellTextColor })}
        />
        <ColorField
          id={`inspect-table-border-${block.id}`}
          label="Border"
          value={block.borderColor}
          onChange={(borderColor) => onChange({ borderColor })}
        />
      </Section>

      <Section title="Typography">
        <SelectField
          id={`inspect-table-font-${block.id}`}
          label="Font"
          icon="text_fields"
          value={block.fontFamily}
          onChange={(fontFamily) => onChange({ fontFamily })}
          style={{ fontFamily: block.fontFamily }}
        >
          {BUTTON_FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </SelectField>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            id={`inspect-table-size-${block.id}`}
            label="Size"
            badge="S"
            value={block.fontSize}
            min={8}
            max={72}
            onChange={(fontSize) => onChange({ fontSize })}
          />
          <SelectField
            id={`inspect-table-weight-${block.id}`}
            label="Weight"
            badge="W"
            value={block.fontWeight}
            onChange={(fontWeight) =>
              onChange({
                fontWeight: fontWeight as EmailTemplateTableBlock["fontWeight"],
              })
            }
          >
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semibold</option>
            <option value="700">Bold</option>
          </SelectField>
        </div>
      </Section>
    </>
  );
}

function ImageStyleFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: {
    src: string;
    alt: string;
    fit: ImageFitMode;
    align: "left" | "center" | "right";
    href: string;
    openInNewTab: boolean;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    paddingX: number;
    paddingY: number;
  };
  onChange: (
    patch: Partial<{
      src: string;
      alt: string;
      fit: ImageFitMode;
      align: "left" | "center" | "right";
      href: string;
      openInNewTab: boolean;
      borderRadius: number;
      borderWidth: number;
      borderColor: string;
      paddingX: number;
      paddingY: number;
    }>,
  ) => void;
}): React.ReactElement {
  return (
    <>
      <Section title="Image">
        <TextField
          id={`${idPrefix}-src`}
          label="URL"
          icon="link"
          value={value.src}
          onChange={(src) => onChange({ src })}
          placeholder="Image URL"
        />
        <TextField
          id={`${idPrefix}-alt`}
          label="Alt text"
          icon="title"
          value={value.alt}
          onChange={(alt) => onChange({ alt })}
        />
        <TextField
          id={`${idPrefix}-href`}
          label="Link"
          icon="link"
          value={value.href}
          onChange={(href) => onChange({ href })}
          placeholder="https://"
        />
        <label className="flex cursor-pointer items-center gap-2 text-[11px] text-[#c7c7c7]">
          <input
            type="checkbox"
            checked={value.openInNewTab}
            aria-label="Open link in new tab"
            onChange={(event) =>
              onChange({ openInNewTab: event.target.checked })
            }
            className="size-3.5 rounded border-[#555] bg-[#1f1f1f]"
          />
          Open link in new tab
        </label>
        <SelectField
          id={`${idPrefix}-fit`}
          label="Fit"
          badge="F"
          value={value.fit ?? "fit"}
          onChange={(fit) => onChange({ fit: parseImageFit(fit) })}
        >
          <option value="fit">Fit content</option>
          <option value="fill">Fill width</option>
        </SelectField>
        <AlignButtons
          groupLabel="Image alignment"
          value={parseImageAlign(value.align)}
          onChange={(align) => onChange({ align })}
        />
      </Section>
      <Section title="Style">
        <NumberField
          id={`${idPrefix}-radius`}
          label="Corner radius"
          icon="rounded_corner"
          value={value.borderRadius}
          min={0}
          max={64}
          suffix="px"
          onChange={(borderRadius) => onChange({ borderRadius })}
        />
        <NumberField
          id={`${idPrefix}-border-w`}
          label="Border width"
          badge="B"
          value={value.borderWidth}
          min={0}
          max={12}
          suffix="px"
          onChange={(borderWidth) => onChange({ borderWidth })}
        />
        <ColorField
          id={`${idPrefix}-border-c`}
          label="Border color"
          value={value.borderColor || DEFAULT_IMAGE_STYLE.borderColor}
          onChange={(borderColor) => onChange({ borderColor })}
        />
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            id={`${idPrefix}-pad-x`}
            label="Pad width"
            badge="W"
            value={value.paddingX}
            min={0}
            max={80}
            onChange={(paddingX) => onChange({ paddingX })}
          />
          <NumberField
            id={`${idPrefix}-pad-y`}
            label="Pad height"
            badge="H"
            value={value.paddingY}
            min={0}
            max={80}
            onChange={(paddingY) => onChange({ paddingY })}
          />
        </div>
      </Section>
    </>
  );
}

function ColumnItemInspector({
  item,
  onChange,
}: {
  item: ColumnItem;
  onChange: (patch: Partial<ColumnItem>) => void;
}): React.ReactElement {
  if (item.kind === "image") {
    return (
      <ImageStyleFields
        idPrefix="inspect-col-item"
        value={{
          src: item.src,
          alt: item.alt,
          fit: item.fit ?? "fit",
          align: parseImageAlign(item.align),
          href: item.href ?? "",
          openInNewTab: Boolean(item.openInNewTab),
          borderRadius: item.borderRadius ?? 0,
          borderWidth: item.borderWidth ?? 0,
          borderColor: item.borderColor ?? DEFAULT_IMAGE_STYLE.borderColor,
          paddingX: item.paddingX ?? 0,
          paddingY: item.paddingY ?? 0,
        }}
        onChange={onChange}
      />
    );
  }

  if (item.kind === "button") {
    const asBlock: EmailTemplateButtonBlock = {
      id: "column-item-button",
      type: "button",
      label: item.label,
      href: item.href,
      align: item.align,
      backgroundColor: item.backgroundColor,
      textColor: item.textColor,
      borderRadius: item.borderRadius,
      borderColor: item.borderColor,
      borderWidth: item.borderWidth,
      paddingX: item.paddingX,
      paddingY: item.paddingY,
      fontFamily: item.fontFamily,
      fontSize: item.fontSize,
      fontWeight: item.fontWeight,
      width: null,
      height: null,
    };
    return (
      <ButtonInspector
        block={asBlock}
        onChange={(patch) => onChange(patch)}
      />
    );
  }

  if (item.kind === "spacer") {
    return (
      <Section title="Layout">
        <NumberField
          id="inspect-col-item-spacer"
          label="Height"
          badge="H"
          value={item.height}
          min={8}
          max={400}
          suffix="px"
          onChange={(height) => onChange({ height })}
        />
      </Section>
    );
  }

  if (item.kind === "text") {
    return (
      <p className="px-3 py-4 text-[11px] leading-relaxed text-[#8c8c8c]">
        Edit this text item directly on the canvas. Use the formatting toolbar
        above the page.
      </p>
    );
  }

  return (
    <p className="px-3 py-4 text-[11px] leading-relaxed text-[#8c8c8c]">
      This nested item can be replaced by dropping a new component into the
      column.
    </p>
  );
}

function DocumentDesignInspector({
  document: doc,
  onChange,
}: {
  document: EmailTemplateDocument;
  onChange: (patch: Partial<EmailTemplateDocument>) => void;
}): React.ReactElement {
  return (
    <>
      <Section title="Page background">
        <ColorField
          id="inspect-doc-page-bg"
          label="Page background"
          value={doc.backgroundColor}
          onChange={(backgroundColor) => onChange({ backgroundColor })}
        />
        <TextField
          id="inspect-doc-bg-image"
          label="Background image"
          icon="image"
          value={doc.backgroundImage}
          onChange={(backgroundImage) => onChange({ backgroundImage })}
          placeholder="https://"
        />
        <SelectField
          id="inspect-doc-bg-size"
          label="Image size"
          badge="S"
          value={doc.backgroundSize}
          onChange={(backgroundSize) =>
            onChange({
              backgroundSize: parseBackgroundSize(backgroundSize) as BackgroundSize,
            })
          }
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="auto">Auto</option>
        </SelectField>
        <SelectField
          id="inspect-doc-bg-position"
          label="Image position"
          badge="P"
          value={doc.backgroundPosition}
          onChange={(backgroundPosition) =>
            onChange({
              backgroundPosition: parseBackgroundPosition(
                backgroundPosition,
              ) as BackgroundPosition,
            })
          }
        >
          <option value="center">Center</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </SelectField>
      </Section>
      <Section title="Content card">
        <ColorField
          id="inspect-doc-content-bg"
          label="Content background"
          value={doc.contentBackgroundColor}
          onChange={(contentBackgroundColor) =>
            onChange({ contentBackgroundColor })
          }
        />
      </Section>
      <Section title="Page margins">
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            id="inspect-doc-margin-top"
            label="Top"
            badge="T"
            value={doc.pageMarginTop ?? 0}
            min={0}
            max={120}
            suffix="px"
            onChange={(pageMarginTop) =>
              onChange({
                pageMarginTop: Math.min(120, Math.max(0, Math.round(pageMarginTop))),
              })
            }
          />
          <NumberField
            id="inspect-doc-margin-right"
            label="Right"
            badge="R"
            value={doc.pageMarginRight ?? 0}
            min={0}
            max={120}
            suffix="px"
            onChange={(pageMarginRight) =>
              onChange({
                pageMarginRight: Math.min(
                  120,
                  Math.max(0, Math.round(pageMarginRight)),
                ),
              })
            }
          />
          <NumberField
            id="inspect-doc-margin-bottom"
            label="Bottom"
            badge="B"
            value={doc.pageMarginBottom ?? 0}
            min={0}
            max={120}
            suffix="px"
            onChange={(pageMarginBottom) =>
              onChange({
                pageMarginBottom: Math.min(
                  120,
                  Math.max(0, Math.round(pageMarginBottom)),
                ),
              })
            }
          />
          <NumberField
            id="inspect-doc-margin-left"
            label="Left"
            badge="L"
            value={doc.pageMarginLeft ?? 0}
            min={0}
            max={120}
            suffix="px"
            onChange={(pageMarginLeft) =>
              onChange({
                pageMarginLeft: Math.min(
                  120,
                  Math.max(0, Math.round(pageMarginLeft)),
                ),
              })
            }
          />
        </div>
      </Section>
    </>
  );
}

function PageBandInspector({
  role,
  band,
  onChange,
  onRemove,
}: {
  role: "header" | "footer";
  band: EmailTemplatePageBand;
  onChange: (patch: Partial<EmailTemplatePageBand>) => void;
  onRemove: () => void;
}): React.ReactElement {
  const title = role === "header" ? "Header" : "Footer";
  return (
    <>
      <Section title={title}>
        <SelectField
          id={`inspect-${role}-align`}
          label="Align"
          badge="A"
          value={band.align}
          onChange={(align) =>
            onChange({
              align:
                align === "center" || align === "right" ? align : "left",
            })
          }
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </SelectField>
        <ColorField
          id={`inspect-${role}-bg`}
          label="Background"
          value={
            band.backgroundColor === "transparent"
              ? "#ffffff"
              : band.backgroundColor
          }
          onChange={(backgroundColor) => onChange({ backgroundColor })}
        />
        <NumberField
          id={`inspect-${role}-pad-x`}
          label="Padding X"
          badge="X"
          value={band.paddingX}
          min={0}
          max={80}
          suffix="px"
          onChange={(paddingX) =>
            onChange({
              paddingX: Math.min(80, Math.max(0, Math.round(paddingX))),
            })
          }
        />
        <NumberField
          id={`inspect-${role}-pad-y`}
          label="Padding Y"
          badge="Y"
          value={band.paddingY}
          min={0}
          max={80}
          suffix="px"
          onChange={(paddingY) =>
            onChange({
              paddingY: Math.min(80, Math.max(0, Math.round(paddingY))),
            })
          }
        />
        <NumberField
          id={`inspect-${role}-border`}
          label={role === "header" ? "Bottom border" : "Top border"}
          badge="B"
          value={band.borderWidth}
          min={0}
          max={20}
          suffix="px"
          onChange={(borderWidth) =>
            onChange({
              borderWidth: Math.min(20, Math.max(0, Math.round(borderWidth))),
            })
          }
        />
        <ColorField
          id={`inspect-${role}-border-color`}
          label="Border color"
          value={band.borderColor}
          onChange={(borderColor) => onChange({ borderColor })}
        />
        <button
          type="button"
          onClick={onRemove}
          className="mt-1 w-full rounded border border-[#555] px-2 py-1.5 text-left text-[11px] text-[#fca5a5] hover:bg-[#3a2a2a]"
        >
          Remove {title.toLowerCase()}
        </button>
      </Section>
    </>
  );
}

export function BuilderInspector({
  block,
  selectedColumnItem = null,
  selectedColumnIndex = null,
  selectedGridCell = null,
  selectedImageTextChild = null,
  selectedPageBand = null,
  pageBand = null,
  document: doc = null,
  onChange,
  onChangeColumnItem,
  onChangeImageTextImage,
  onChangePageBand,
  onRemovePageBand,
  onChangeDocument,
  className,
}: BuilderInspectorProps): React.ReactElement {
  const title = selectedColumnItem
    ? selectedColumnItem.kind === "image"
      ? "Image"
      : selectedColumnItem.kind === "button"
        ? "Button"
        : selectedColumnItem.kind === "spacer"
          ? "Blank Space"
          : selectedColumnItem.kind === "text"
            ? "Text"
            : "Item"
    : selectedImageTextChild === "image"
      ? "Image"
      : selectedImageTextChild === "text"
        ? "Text"
        : selectedColumnIndex != null
          ? `Column ${selectedColumnIndex + 1}`
          : selectedGridCell
            ? `Cell ${selectedGridCell.rowIndex + 1},${selectedGridCell.columnIndex + 1}`
            : selectedPageBand === "header"
              ? "Header"
              : selectedPageBand === "footer"
                ? "Footer"
                : block
                  ? BLOCK_TYPE_LABELS[block.type]
                  : "Design";

  return (
    <aside
      aria-label="Component properties"
      className={cn(
        "flex w-full shrink-0 flex-col border-l border-[#333] bg-[#2c2c2c] text-[11px] text-[#f5f5f5] md:w-[260px]",
        className,
      )}
    >
      <div className="flex h-10 items-center border-b border-[#444] px-3">
        <span className="text-[12px] font-semibold text-white">{title}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {selectedColumnItem && onChangeColumnItem ? (
          <>
            <p className="border-b border-[#444] px-3 py-2 text-[10px] text-[#8c8c8c]">
              Editing item inside{" "}
              {block?.type === "grid" ? "Grid" : "Columns"}
            </p>
            <ColumnItemInspector
              item={selectedColumnItem}
              onChange={onChangeColumnItem}
            />
          </>
        ) : selectedImageTextChild && block?.type === "imageText" ? (
          <>
            <p className="border-b border-[#444] px-3 py-2 text-[10px] text-[#8c8c8c]">
              Editing child inside Image + Text
            </p>
            {selectedImageTextChild === "image" && onChangeImageTextImage ? (
              <ImageStyleFields
                idPrefix={`inspect-it-child-img-${block.id}`}
                value={{
                  src: block.image.src,
                  alt: block.image.alt,
                  fit: block.image.fit ?? "fit",
                  align: parseImageAlign(block.image.align),
                  href: block.image.href ?? "",
                  openInNewTab: Boolean(block.image.openInNewTab),
                  borderRadius: block.image.borderRadius ?? 0,
                  borderWidth: block.image.borderWidth ?? 0,
                  borderColor:
                    block.image.borderColor ?? DEFAULT_IMAGE_STYLE.borderColor,
                  paddingX: block.image.paddingX ?? 0,
                  paddingY: block.image.paddingY ?? 0,
                }}
                onChange={(patch) => onChangeImageTextImage(patch)}
              />
            ) : (
              <p className="px-3 py-4 text-[11px] leading-relaxed text-[#8c8c8c]">
                Edit this text item directly on the canvas. Use the formatting
                toolbar above the page.
              </p>
            )}
          </>
        ) : selectedColumnIndex != null && block?.type === "columns" ? (
          <>
            <p className="border-b border-[#444] px-3 py-2 text-[10px] text-[#8c8c8c]">
              Editing Column {selectedColumnIndex + 1}. Adjust shared column
              layout below, or select a nested item for its own settings.
            </p>
            <ColumnsInspector
              block={block}
              onChange={(patch) => onChange(patch)}
              focusColumnIndex={selectedColumnIndex}
            />
          </>
        ) : selectedGridCell && block?.type === "grid" ? (
          <>
            <p className="border-b border-[#444] px-3 py-2 text-[10px] text-[#8c8c8c]">
              Editing cell {selectedGridCell.rowIndex + 1},
              {selectedGridCell.columnIndex + 1}. Drop components into the cell
              on the canvas, or select a nested item for its settings.
            </p>
            <GridInspector block={block} onChange={(patch) => onChange(patch)} />
          </>
        ) : selectedPageBand && pageBand && onChangePageBand ? (
          <PageBandInspector
            role={selectedPageBand}
            band={pageBand}
            onChange={onChangePageBand}
            onRemove={() => onRemovePageBand?.()}
          />
        ) : !block ? (
          doc && onChangeDocument ? (
            <DocumentDesignInspector
              document={doc}
              onChange={onChangeDocument}
            />
          ) : (
            <p className="px-3 py-4 text-[11px] leading-relaxed text-[#8c8c8c]">
              Select a component on the canvas to edit its properties.
            </p>
          )
        ) : block.type === "button" ? (
          <ButtonInspector
            block={block}
            onChange={(patch) => onChange(patch)}
          />
        ) : block.type === "columns" ? (
          <ColumnsInspector
            block={block}
            onChange={(patch) => onChange(patch)}
          />
        ) : block.type === "grid" ? (
          <GridInspector block={block} onChange={(patch) => onChange(patch)} />
        ) : block.type === "table" ? (
          <TableInspector block={block} onChange={(patch) => onChange(patch)} />
        ) : block.type === "image" ? (
          <>
            <ImageStyleFields
              idPrefix={`inspect-img-${block.id}`}
              value={{
                src: block.src,
                alt: block.alt,
                fit: block.fit ?? "fit",
                align: parseImageAlign(block.align),
                href: block.href ?? "",
                openInNewTab: Boolean(block.openInNewTab),
                borderRadius: block.borderRadius ?? 0,
                borderWidth: block.borderWidth ?? 0,
                borderColor: block.borderColor ?? DEFAULT_IMAGE_STYLE.borderColor,
                paddingX: block.paddingX ?? 0,
                paddingY: block.paddingY ?? 0,
              }}
              onChange={(patch) =>
                onChange(patch as Partial<EmailTemplateImageBlock>)
              }
            />
            <Section title="Layout">
              <SizeFields
                idPrefix={`inspect-img-size-${block.id}`}
                width={block.width}
                height={block.height}
                onChange={onChange}
              />
              <p className="text-[10px] leading-relaxed text-[#8c8c8c]">
                Fit content keeps the image’s natural size (capped to the
                column). Fill width stretches it across the available space.
                Alignment positions fit-content images. Width overrides Fit when
                set.
              </p>
            </Section>
          </>
        ) : block.type === "spacer" ? (
          <>
            <BoxChromeFields
              idPrefix={`inspect-spacer-chrome-${block.id}`}
              value={{
                backgroundColor:
                  block.backgroundColor ?? DEFAULT_BOX_CHROME.backgroundColor,
                borderWidth: block.borderWidth ?? 0,
                borderColor:
                  block.borderColor ?? DEFAULT_BOX_CHROME.borderColor,
                borderRadius: block.borderRadius ?? 0,
                paddingX: block.paddingX ?? 0,
                paddingY: block.paddingY ?? 0,
              }}
              onChange={onChange}
            />
            <Section title="Layout">
              <SizeFields
                idPrefix={`inspect-spacer-size-${block.id}`}
                width={block.width}
                height={block.height}
                onChange={(patch) => {
                  if (patch.width !== undefined) onChange({ width: patch.width });
                  if (patch.height != null && patch.height > 0) {
                    onChange({ height: patch.height });
                  }
                }}
              />
            </Section>
          </>
        ) : block.type === "imageText" ? (
          <>
            <BoxChromeFields
              idPrefix={`inspect-it-chrome-${block.id}`}
              value={{
                backgroundColor:
                  block.backgroundColor ?? DEFAULT_BOX_CHROME.backgroundColor,
                borderWidth: block.borderWidth ?? 0,
                borderColor:
                  block.borderColor ?? DEFAULT_BOX_CHROME.borderColor,
                borderRadius: block.borderRadius ?? 0,
                paddingX: block.paddingX ?? 0,
                paddingY: block.paddingY ?? 0,
              }}
              onChange={onChange}
            />
            <Section title="Image + Text">
              <SelectField
                id={`inspect-it-pos-${block.id}`}
                label="Image position"
                icon="view_column"
                value={block.imagePosition}
                onChange={(imagePosition) =>
                  onChange({
                    imagePosition: imagePosition as "left" | "right",
                  })
                }
              >
                <option value="left">Image left</option>
                <option value="right">Image right</option>
              </SelectField>
            </Section>
            <Section title="Layout">
              <SizeFields
                idPrefix={`inspect-it-size-${block.id}`}
                width={block.width}
                height={block.height}
                onChange={onChange}
              />
            </Section>
          </>
        ) : block.type === "text" || block.type === "html" ? (
          <>
            <BoxChromeFields
              idPrefix={`inspect-${block.type}-chrome-${block.id}`}
              value={{
                backgroundColor:
                  block.backgroundColor ?? DEFAULT_BOX_CHROME.backgroundColor,
                borderWidth: block.borderWidth ?? 0,
                borderColor:
                  block.borderColor ?? DEFAULT_BOX_CHROME.borderColor,
                borderRadius: block.borderRadius ?? 0,
                paddingX: block.paddingX ?? 0,
                paddingY: block.paddingY ?? 0,
              }}
              onChange={onChange}
            />
            <Section title="Layout">
              <SizeFields
                idPrefix={`inspect-${block.type}-size-${block.id}`}
                width={block.width}
                height={block.height}
                onChange={onChange}
              />
            </Section>
          </>
        ) : (
          <p className="px-3 py-4 text-[11px] leading-relaxed text-[#8c8c8c]">
            Edit this block directly on the canvas.
          </p>
        )}
      </div>
    </aside>
  );
}
