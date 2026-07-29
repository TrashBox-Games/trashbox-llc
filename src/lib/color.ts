/**
 * Lightweight CSS color helpers for the template builder (hex + alpha).
 * Canonical storage: #rrggbb or #rrggbbaa (lowercase).
 */

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

function clampByte(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function clampAlpha(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

function expandHex3(hex: string): string {
  return hex
    .split("")
    .map((ch) => ch + ch)
    .join("");
}

export function parseCssColor(input: string): RgbaColor | null {
  const raw = input.trim();
  if (!raw) return null;

  const hexMatch = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  if (hexMatch) {
    let hex = hexMatch[1]!;
    if (hex.length === 3 || hex.length === 4) hex = expandHex3(hex);
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const a =
      hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a: clampAlpha(a) };
  }

  const rgbaMatch = raw.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+%?))?\s*\)$/i,
  );
  if (rgbaMatch) {
    const aRaw = rgbaMatch[4];
    let a = 1;
    if (aRaw != null) {
      a = aRaw.endsWith("%")
        ? Number.parseFloat(aRaw) / 100
        : Number.parseFloat(aRaw);
    }
    return {
      r: clampByte(Number.parseFloat(rgbaMatch[1]!)),
      g: clampByte(Number.parseFloat(rgbaMatch[2]!)),
      b: clampByte(Number.parseFloat(rgbaMatch[3]!)),
      a: clampAlpha(a),
    };
  }

  return null;
}

function toHex2(value: number): string {
  return clampByte(value).toString(16).padStart(2, "0");
}

/** Canonical #rrggbb or #rrggbbaa. */
export function formatCssColor(color: RgbaColor): string {
  const rgb = `#${toHex2(color.r)}${toHex2(color.g)}${toHex2(color.b)}`;
  if (color.a >= 0.999) return rgb;
  return `${rgb}${toHex2(Math.round(clampAlpha(color.a) * 255))}`;
}

/** Opaque #rrggbb for native <input type="color">. */
export function toOpaqueHex(input: string, fallback = "#000000"): string {
  const color = parseCssColor(input);
  if (!color) return fallback;
  return `#${toHex2(color.r)}${toHex2(color.g)}${toHex2(color.b)}`;
}

export function getAlphaPercent(input: string): number {
  const color = parseCssColor(input);
  if (!color) return 100;
  return Math.round(clampAlpha(color.a) * 100);
}

export function setColorAlpha(input: string, alphaPercent: number): string {
  const color = parseCssColor(input) ?? { r: 0, g: 0, b: 0, a: 1 };
  return formatCssColor({
    ...color,
    a: clampAlpha(alphaPercent / 100),
  });
}

export function setColorRgb(input: string, rgbHex: string): string {
  const next = parseCssColor(rgbHex);
  const prev = parseCssColor(input) ?? { r: 0, g: 0, b: 0, a: 1 };
  if (!next) return input;
  return formatCssColor({ r: next.r, g: next.g, b: next.b, a: prev.a });
}

/** Hex digits only for the RGB display field (6 chars). */
export function toRgbHexDisplay(input: string): string {
  return toOpaqueHex(input).replace(/^#/, "").toUpperCase();
}

/**
 * Email-safer CSS color: #rrggbb when opaque, rgba() when transparent.
 * Many clients mishandle 8-digit hex.
 */
export function toEmailCssColor(input: string): string {
  const color = parseCssColor(input);
  if (!color) return input;
  if (color.a >= 0.999) {
    return `#${toHex2(color.r)}${toHex2(color.g)}${toHex2(color.b)}`;
  }
  const alpha = Math.round(color.a * 100) / 100;
  return `rgba(${clampByte(color.r)}, ${clampByte(color.g)}, ${clampByte(color.b)}, ${alpha})`;
}
