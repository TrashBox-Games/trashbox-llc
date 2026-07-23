import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlatformNav } from "./PlatformNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/platform/",
}));

describe("PlatformNav", () => {
  it("links Features under /platform and Login to portal", () => {
    render(<PlatformNav />);

    expect(screen.getByRole("link", { name: /^login$/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/portal\/login\/?$/),
    );
    expect(screen.getByRole("link", { name: /^features$/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/platform\/features\/?$/),
    );
  });
});
