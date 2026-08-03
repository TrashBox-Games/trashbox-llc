import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PortalUserMenu } from "./PortalUserMenu";

describe("PortalUserMenu", () => {
  it("opens a user panel with avatar, name, email, and sign out", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();

    render(
      <PortalUserMenu
        email="owner@example.com"
        name="Ada Lovelace"
        onSignOut={onSignOut}
      />,
    );

    expect(
      screen.queryByRole("menuitem", { name: /sign out/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /account menu/i }));

    const panel = screen.getByRole("menu");
    expect(within(panel).getByText("Ada Lovelace")).toBeInTheDocument();
    expect(within(panel).getByText("owner@example.com")).toBeInTheDocument();
    expect(within(panel).getByLabelText(/ada lovelace/i)).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /^settings$/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: /sign out/i }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("navigates to account settings from the menu", async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });

    render(
      <PortalUserMenu
        email="owner@example.com"
        name="Ada Lovelace"
        onSignOut={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    await user.click(screen.getByRole("menuitem", { name: /^settings$/i }));
    expect(assign).toHaveBeenCalledWith("/portal/account/");
  });

  it("falls back to email-derived name when none is provided", async () => {
    const user = userEvent.setup();
    render(
      <PortalUserMenu email="ada.lovelace@example.com" onSignOut={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("shows optional workspace name in the panel", async () => {
    const user = userEvent.setup();
    render(
      <PortalUserMenu
        email="owner@example.com"
        name="Ada Lovelace"
        clientName="Acme Co"
        onSignOut={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    expect(screen.getByText("Acme Co")).toBeInTheDocument();
  });
});
