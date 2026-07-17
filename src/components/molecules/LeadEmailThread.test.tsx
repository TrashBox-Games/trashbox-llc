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
      "/portal/settings/",
    );
    expect(
      screen.queryByRole("button", { name: /send reply/i }),
    ).not.toBeInTheDocument();
  });

  it("sends a reply when connected", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn().mockResolvedValue(undefined);

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
        onSend={onSend}
      />,
    );

    expect(screen.getByText("Thanks for reaching out")).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^reply$/i), "Happy to help");
    await user.click(screen.getByRole("button", { name: /send reply/i }));
    expect(onSend).toHaveBeenCalledWith("Happy to help");
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

    expect(screen.getByRole("button", { name: /send reply/i })).toBeDisabled();
  });
});
