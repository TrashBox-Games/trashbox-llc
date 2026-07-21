import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LeadEmailThread } from "./LeadEmailThread";

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
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute(
      "href",
      "/portal/settings/email-accounts/",
    );
    expect(
      screen.queryByRole("button", { name: /send message/i }),
    ).not.toBeInTheDocument();
  });

  it("reveals a message body when its timeline node is expanded", async () => {
    const user = userEvent.setup();

    render(
      <LeadEmailThread
        formMessage="Need a quote"
        formFrom="ada@example.com"
        formAt="2026-07-15T12:00:00.000Z"
        messages={[
          {
            clientId: "c1",
            submissionId: "s1",
            messageId: "m1",
            direction: "outbound",
            from: "sales@example.com",
            to: "ada@example.com",
            subject: "Re: Need a quote",
            bodyText: "Thanks for reaching out",
            createdAt: "2026-07-15T13:00:00.000Z",
            sentBy: "owner@example.com",
          },
        ]}
        mailboxConnected
        onSend={vi.fn()}
      />,
    );

    expect(screen.queryByText("Thanks for reaching out")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /re: need a quote/i }));
    expect(screen.getByText("Thanks for reaching out")).toBeInTheDocument();
  });

  it("sends a reply with plain text and html when connected", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(
      <LeadEmailThread
        formMessage="Need a quote"
        formFrom="ada@example.com"
        formAt="2026-07-15T12:00:00.000Z"
        messages={[]}
        mailboxConnected
        onSend={onSend}
      />,
    );

    await user.click(screen.getByRole("textbox", { name: /reply/i }));
    await user.type(screen.getByRole("textbox", { name: /reply/i }), "Happy to help");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(onSend).toHaveBeenCalledWith("Happy to help", expect.any(String));
  });

  it("disables send when draft is empty", () => {
    render(
      <LeadEmailThread
        formMessage="Need a quote"
        formFrom="ada@example.com"
        formAt="2026-07-15T12:00:00.000Z"
        messages={[]}
        mailboxConnected
        onSend={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeDisabled();
  });
});
