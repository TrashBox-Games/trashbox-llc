import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LeadEmailThread } from "./LeadEmailThread";

const fromOptions = [
  {
    id: "s1",
    label: "Sales Team (Default)",
    displayName: "Sales Team",
  },
  { id: "s2", label: "Support", displayName: "Support" },
];

describe("LeadEmailThread", () => {
  it("shows settings CTA when mailbox is disconnected", () => {
    render(
      <LeadEmailThread
        formMessage="Need a quote"
        formFrom="ada@example.com"
        formAt="2026-07-15T12:00:00.000Z"
        messages={[]}
        mailboxConnected={false}
        onSend={vi.fn()}
      />,
    );

    expect(screen.getByText(/connect a business mailbox/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /send message/i }),
    ).not.toBeInTheDocument();
  });

  it("sends a reply with the selected Sender Display Name", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(
      <LeadEmailThread
        formMessage="Need a quote"
        formFrom="ada@example.com"
        formAt="2026-07-15T12:00:00.000Z"
        messages={[]}
        mailboxConnected
        fromOptions={fromOptions}
        onSend={onSend}
      />,
    );

    await user.click(screen.getByRole("textbox", { name: /reply/i }));
    await user.type(screen.getByRole("textbox", { name: /reply/i }), "Happy to help");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(onSend).toHaveBeenCalledWith("Happy to help", expect.any(String), {
      fromIdentityId: "s1",
    });
  });

  it("disables send when no Sender Display Name is assigned", () => {
    render(
      <LeadEmailThread
        formMessage="Need a quote"
        formFrom="ada@example.com"
        formAt="2026-07-15T12:00:00.000Z"
        messages={[]}
        mailboxConnected
        fromOptions={[]}
        onSend={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/No Sender Display Name assigned/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeDisabled();
  });

  it("disables send when draft is empty", () => {
    render(
      <LeadEmailThread
        formMessage="Need a quote"
        formFrom="ada@example.com"
        formAt="2026-07-15T12:00:00.000Z"
        messages={[]}
        mailboxConnected
        fromOptions={fromOptions}
        onSend={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeDisabled();
  });
});
