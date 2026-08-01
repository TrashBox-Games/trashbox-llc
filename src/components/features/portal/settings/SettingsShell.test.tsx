import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsShell } from "./SettingsShell";

const usePathname = vi.fn(() => "/portal/settings/general/");

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("SettingsShell", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/portal/settings/general/");
  });

  it("shows settings chrome, sidebar, and section content", () => {
    render(
      <SettingsShell>
        <p>Section body</p>
      </SettingsShell>,
    );

    expect(
      screen.getByRole("heading", { name: /^settings$/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^general$/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Section body")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /settings/i })).toBeInTheDocument();
  });

  it("falls back to the default section when pathname is null", () => {
    usePathname.mockReturnValue(null);

    expect(() =>
      render(
        <SettingsShell>
          <p>Section body</p>
        </SettingsShell>,
      ),
    ).not.toThrow();

    expect(
      screen.getByRole("heading", { name: /^settings$/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Section body")).toBeInTheDocument();
  });

  it("uses organization settings chrome for org scope", () => {
    usePathname.mockReturnValue("/portal/acme/settings/general/");

    render(
      <SettingsShell scope="org">
        <p>Org section body</p>
      </SettingsShell>,
    );

    expect(
      screen.getByRole("heading", {
        name: /organization settings/i,
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Org section body")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /billing/i })).toBeInTheDocument();
  });
});

