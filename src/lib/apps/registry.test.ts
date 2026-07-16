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

  it("returns null for unknown pages", () => {
    expect(getAppMarkdown("unknown", "page")).toBeNull();
  });

  it("returns SEO metadata when configured", () => {
    const meta = getAppPageMeta("bmplayer", "privacy");
    expect(meta?.title).toContain("BMPlayer");
  });

  it("lists markdown pages for static export", () => {
    expect(listAppMarkdownPages()).toContainEqual({
      appSlug: "bmplayer",
      pageSlug: "privacy",
    });
  });

  it("title-cases slug segments", () => {
    expect(titleCaseSegment("privacy-policy")).toBe("Privacy Policy");
  });
});
