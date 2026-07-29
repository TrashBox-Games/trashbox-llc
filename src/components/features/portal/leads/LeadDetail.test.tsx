import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { LeadMessage, Submission } from "@/lib/api";
import { LeadDetail } from "./LeadDetail";

const baseSubmission: Submission = {
  clientId: "c1",
  submissionId: "s1",
  senderName: "Ada",
  senderEmail: "ada@example.com",
  message: "[Full-Stack Development]\n\nYour mom as a website",
  submittedAt: "2026-07-15T12:00:00.000Z",
  status: "new",
  tags: [],
  notes: [],
  assignedTo: null,
  metadata: { service: "Full-Stack Development" },
};

const outboundReply: LeadMessage = {
  messageId: "m1",
  submissionId: "s1",
  clientId: "c1",
  direction: "outbound",
  from: "biz@example.com",
  to: "ada@example.com",
  subject: "Re: quote",
  bodyText: "Thanks for reaching out",
  createdAt: "2026-07-15T13:00:00.000Z",
};

const laterReply: LeadMessage = {
  messageId: "m2",
  submissionId: "s1",
  clientId: "c1",
  direction: "inbound",
  from: "ada@example.com",
  to: "biz@example.com",
  subject: "Re: quote",
  bodyText: "Sounds good, when can we start?",
  createdAt: "2026-07-15T14:00:00.000Z",
};

describe("LeadDetail", () => {
  it("changes status and adds a note", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const onAddNote = vi.fn().mockResolvedValue(undefined);

    render(
      <LeadDetail
        submission={{
          ...baseSubmission,
          message: "Need a quote",
          metadata: undefined,
        }}
        members={[
          {
            email: "sarah@example.com",
            role: "member",
            joinedAt: "2026-01-01",
            emailNotifications: false,
          },
        ]}
        onUpdate={onUpdate}
        onAddNote={onAddNote}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^status$/i }));
    await user.click(
      within(screen.getByRole("listbox")).getByRole("option", {
        name: /contacted/i,
      }),
    );
    expect(onUpdate).toHaveBeenCalledWith({ status: "contacted" });

    expect(screen.queryByLabelText(/add note/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /show notes/i }));

    await user.type(
      screen.getByLabelText(/add note/i),
      "Called customer July 15, requested estimate",
    );
    await user.click(screen.getByRole("button", { name: /save note/i }));
    expect(onAddNote).toHaveBeenCalledWith(
      "Called customer July 15, requested estimate",
    );
  });

  it("keeps notes collapsed until show notes is clicked", async () => {
    const user = userEvent.setup();

    render(
      <LeadDetail
        submission={{
          ...baseSubmission,
          notes: [
            {
              id: "n1",
              body: "Followed up by email.",
              authorEmail: "owner@example.com",
              createdAt: "2026-07-15T14:00:00.000Z",
            },
          ],
        }}
        members={[]}
        onUpdate={vi.fn()}
        onAddNote={vi.fn()}
      />,
    );

    expect(screen.queryByText("Followed up by email.")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/add note/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /show notes/i }));

    expect(screen.getByText("Followed up by email.")).toBeInTheDocument();
    expect(screen.getByLabelText(/add note/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /hide notes/i }));
    expect(screen.queryByText("Followed up by email.")).not.toBeInTheDocument();
  });

  it("shows the form message and metadata when there are no thread replies", () => {
    render(
      <LeadDetail
        submission={baseSubmission}
        members={[]}
        onUpdate={vi.fn()}
        onAddNote={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Your mom as a website/i, { selector: "p" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^service$/i)).toBeInTheDocument();
    expect(screen.getByText("Full-Stack Development")).toBeInTheDocument();
  });

  it("places show history between the lead header and the latest message", async () => {
    const user = userEvent.setup();

    render(
      <LeadDetail
        submission={baseSubmission}
        members={[]}
        messages={[outboundReply, laterReply]}
        onUpdate={vi.fn()}
        onAddNote={vi.fn()}
        onSendMessage={vi.fn()}
        composerLibrary={{ templates: [], signatures: [], snippets: [] }}
      />,
    );

    const latest = screen.getByText(/Sounds good, when can we start\?/i, {
      selector: "p",
    });
    const showHistory = screen.getByRole("button", { name: /show history/i });
    const leadName = screen.getByRole("heading", { name: /^Ada$/i });

    expect(
      leadName.compareDocumentPosition(showHistory) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      showHistory.compareDocumentPosition(latest) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText(/^service$/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^history$/i }),
    ).not.toBeInTheDocument();

    await user.click(showHistory);

    expect(screen.getByRole("heading", { name: /^history$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/form submission event/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Re: quote$/i }),
    ).toBeInTheDocument();

    const history = screen.getByRole("heading", { name: /^history$/i });
    expect(
      showHistory.compareDocumentPosition(history) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      history.compareDocumentPosition(latest) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /hide history/i }));
    expect(
      screen.queryByRole("heading", { name: /^history$/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps the reply composer without the timeline when there are no replies", () => {
    render(
      <LeadDetail
        submission={baseSubmission}
        members={[]}
        messages={[]}
        mailboxConnected
        fromOptions={[
          {
            id: "s1",
            label: "Sales Team",
            displayName: "Sales Team",
          },
        ]}
        onUpdate={vi.fn()}
        onAddNote={vi.fn()}
        onSendMessage={vi.fn()}
        composerLibrary={{ templates: [], signatures: [], snippets: [] }}
      />,
    );

    expect(
      screen.queryByRole("heading", { name: /^history$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /show history/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeInTheDocument();
  });
});
