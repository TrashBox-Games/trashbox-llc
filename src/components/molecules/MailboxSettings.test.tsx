import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MailboxSettings } from "./MailboxSettings";

describe("MailboxSettings", () => {
  it("shows connect buttons for owners when disconnected", async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn().mockResolvedValue(undefined);

    render(
      <MailboxSettings
        role="owner"
        mailbox={{ connected: false }}
        onConnect={onConnect}
        onDisconnect={vi.fn()}
        onSync={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /connect google workspace/i }),
    );
    expect(onConnect).toHaveBeenCalledWith("gmail");

    await user.click(
      screen.getByRole("button", { name: /connect microsoft 365/i }),
    );
    expect(onConnect).toHaveBeenCalledWith("microsoft");
  });

  it("hides connect for members when disconnected", () => {
    render(
      <MailboxSettings
        role="member"
        mailbox={{ connected: false }}
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
        onSync={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /connect google workspace/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/ask an owner or admin/i)).toBeInTheDocument();
  });

  it("shows disconnect and sync when connected for admin", async () => {
    const user = userEvent.setup();
    const onDisconnect = vi.fn().mockResolvedValue(undefined);
    const onSync = vi.fn().mockResolvedValue(undefined);

    render(
      <MailboxSettings
        role="admin"
        mailbox={{
          connected: true,
          provider: "gmail",
          email: "sales@example.com",
          connectedBy: "owner@example.com",
          status: "connected",
        }}
        onConnect={vi.fn()}
        onDisconnect={onDisconnect}
        onSync={onSync}
      />,
    );

    expect(screen.getByText("sales@example.com")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /sync now/i }));
    expect(onSync).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /disconnect/i }));
    expect(onDisconnect).toHaveBeenCalled();
  });

  it("links to Sending Preferences for From identity settings", () => {
    render(
      <MailboxSettings
        role="owner"
        mailbox={{ connected: false }}
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
        onSync={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("link", { name: /sending preferences/i }),
    ).toHaveAttribute("href", "/portal/settings/sending-preferences/");
  });
});
