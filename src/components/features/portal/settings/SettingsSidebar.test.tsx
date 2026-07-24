import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsSidebar } from "./SettingsSidebar";

const usePathname = vi.fn(() => "/portal/settings/email-accounts/");

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("SettingsSidebar", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/portal/settings/email-accounts/");
  });

  it("renders group toggles and section links with icons", () => {
    render(<SettingsSidebar />);

    expect(screen.getByRole("navigation", { name: /settings/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /communication/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email accounts/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/portal\/settings\/email-accounts\/?$/),
    );
  });

  it("marks the active section and expands its group", () => {
    render(<SettingsSidebar />);

    const active = screen.getByRole("link", { name: /email accounts/i });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("button", { name: /communication/i }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses and expands groups", async () => {
    const user = userEvent.setup();
    render(<SettingsSidebar />);

    const communication = screen.getByRole("button", { name: /communication/i });
    expect(communication).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /email accounts/i })).toBeInTheDocument();

    await user.click(communication);
    expect(communication).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("link", { name: /email accounts/i }),
    ).not.toBeInTheDocument();

    await user.click(communication);
    expect(communication).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /email accounts/i })).toBeInTheDocument();
  });

  it("renders without crashing when pathname is null", () => {
    usePathname.mockReturnValue(null);

    expect(() => render(<SettingsSidebar />)).not.toThrow();
    expect(screen.getByRole("navigation", { name: /settings/i })).toBeInTheDocument();
  });
});
