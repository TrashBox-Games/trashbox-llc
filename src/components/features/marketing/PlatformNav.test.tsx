import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlatformNav } from "./PlatformNav";

const usePathname = vi.fn(() => "/platform/");

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("PlatformNav", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/platform/");
  });

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

  it("renders without crashing when pathname is null", () => {
    usePathname.mockReturnValue(null);

    expect(() => render(<PlatformNav />)).not.toThrow();
    expect(screen.getByRole("link", { name: /^features$/i })).toBeInTheDocument();
  });
});
