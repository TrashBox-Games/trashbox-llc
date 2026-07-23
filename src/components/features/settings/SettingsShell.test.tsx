import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsShell } from "./SettingsShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portal/settings/general/",
}));

describe("SettingsShell", () => {
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
});
