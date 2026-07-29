import { describe, expect, it } from "vitest";
import {
  formatCssColor,
  getAlphaPercent,
  parseCssColor,
  setColorAlpha,
  setColorRgb,
  toEmailCssColor,
  toOpaqueHex,
  toRgbHexDisplay,
} from "@/lib/color";

describe("color", () => {
  it("parses hex with and without alpha", () => {
    expect(parseCssColor("#2563eb")).toEqual({
      r: 37,
      g: 99,
      b: 235,
      a: 1,
    });
    expect(parseCssColor("#2563eb80")?.a).toBeCloseTo(0.502, 2);
  });

  it("formats and preserves alpha when changing rgb", () => {
    const withAlpha = setColorAlpha("#2563eb", 50);
    expect(getAlphaPercent(withAlpha)).toBe(50);
    const next = setColorRgb(withAlpha, "#111827");
    expect(toOpaqueHex(next)).toBe("#111827");
    expect(getAlphaPercent(next)).toBe(50);
    expect(toRgbHexDisplay(next)).toBe("111827");
  });

  it("emits rgba for transparent email CSS", () => {
    expect(toEmailCssColor("#ffffff")).toBe("#ffffff");
    expect(toEmailCssColor(formatCssColor({ r: 37, g: 99, b: 235, a: 0.5 }))).toBe(
      "rgba(37, 99, 235, 0.5)",
    );
  });
});
