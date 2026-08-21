import { describe, expect, it } from "vitest";
import {
  getAppMarkdown,
  getAppPageMeta,
  listAppMarkdownPages,
  titleCaseSegment,
} from "./registry";

describe("apps registry", () => {
  it("loads bmplayer privacy markdown", () => {
    const markdown = getAppMarkdown("bmplayer", "privacy");
    expect(markdown).toBeTruthy();
    expect(markdown).toContain("Privacy Policy");
  });

  it("loads calorie tracker privacy markdown", () => {
    const markdown = getAppMarkdown("CalorieTracker", "privacy");
    expect(markdown).toBeTruthy();
    expect(markdown).toContain("Privacy Policy");
    expect(markdown).toContain("Calorie & Protein Tracker");
    expect(markdown).toContain("this app collects nothing");
  });

  it("returns null for unknown pages", () => {
    expect(getAppMarkdown("unknown", "page")).toBeNull();
  });

  it("returns SEO metadata when configured", () => {
    const bmplayer = getAppPageMeta("bmplayer", "privacy");
    expect(bmplayer?.title).toContain("BMPlayer");

    const calorieTracker = getAppPageMeta("CalorieTracker", "privacy");
    expect(calorieTracker?.title).toContain("Calorie");
    expect(calorieTracker?.description).toMatch(/device/i);
  });

  it("lists markdown pages for static export", () => {
    expect(listAppMarkdownPages()).toContainEqual({
      appSlug: "bmplayer",
      pageSlug: "privacy",
    });
    expect(listAppMarkdownPages()).toContainEqual({
      appSlug: "calorietracker",
      pageSlug: "privacy",
    });
  });

  it("title-cases slug segments", () => {
    expect(titleCaseSegment("privacy-policy")).toBe("Privacy Policy");
  });
});
