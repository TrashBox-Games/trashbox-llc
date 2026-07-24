import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SendingPreferencesSettings } from "./SendingPreferencesSettings";

const mailbox = {
  connected: true as const,
  provider: "gmail" as const,
  email: "sales@example.com",
  status: "connected" as const,
  fromIdentities: [] as { id: string; name: string; createdAt: string }[],
};

describe("SendingPreferencesSettings", () => {
  it("lets managers add a Sender Display Name", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn().mockResolvedValue(undefined);

    render(
      <SendingPreferencesSettings
        canManage
        mailbox={mailbox}
        onPatch={onPatch}
      />,
    );

    expect(
      screen.getByText(/Create the Sender Display Names/i),
    ).toBeInTheDocument();
    await user.type(
      screen.getByLabelText(/New Sender Display Name/i),
      "Sales Team",
    );
    await user.click(screen.getByRole("button", { name: /Add Name/i }));
    expect(onPatch).toHaveBeenCalledWith({
      action: "addIdentity",
      name: "Sales Team",
    });
  });

  it("explains names are not separate email addresses", () => {
    render(
      <SendingPreferencesSettings
        canManage
        mailbox={mailbox}
        onPatch={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/not separate email addresses/i),
    ).toBeInTheDocument();
  });

  it("shows read-only catalog without manage permission", () => {
    render(
      <SendingPreferencesSettings
        canManage={false}
        mailbox={{
          ...mailbox,
          fromIdentities: [
            {
              id: "id1",
              name: "Sales Team",
              createdAt: "2026-07-15T12:00:00.000Z",
            },
          ],
        }}
        onPatch={vi.fn()}
      />,
    );

    expect(screen.getByText("Sales Team")).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/New Sender Display Name/i),
    ).not.toBeInTheDocument();
  });
});
