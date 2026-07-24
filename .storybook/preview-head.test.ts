import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const storybookDir = dirname(fileURLToPath(import.meta.url));

describe("Storybook preview fonts", () => {
  it("loads Material Symbols Outlined so icon ligatures render as glyphs", () => {
    const head = readFileSync(join(storybookDir, "preview-head.html"), "utf8");

    expect(head).toContain("fonts.googleapis.com");
    expect(head).toContain("Material+Symbols+Outlined");
    expect(head).toContain("family=Manrope");
    expect(head).toContain("family=Space+Grotesk");
  });
});
