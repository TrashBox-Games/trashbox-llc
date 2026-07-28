import type { ComponentProps } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
  EmailSignature,
  EmailSnippet,
  EmailTemplate,
  LeadMessage,
} from "@/lib/api";
import { LeadEmailThread } from "./LeadEmailThread";

const fromOptions = [
  {
    id: "s1",
    label: "Sales Team (Default)",
    displayName: "Sales Team",
  },
  { id: "s2", label: "Support", displayName: "Support" },
];

const templates: EmailTemplate[] = [
  {
    clientId: "c1",
    id: "t1",
    name: "Intro reply",
    subject: "Thanks for reaching out",
    bodyText: "Hi {{lead.first_name}}, happy to help.",
    bodyHtml: "<p>Hi {{lead.first_name}}, happy to help.</p>",
    createdBy: "owner@example.com",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
];

const signatures: EmailSignature[] = [
  {
    clientId: "c1",
    id: "sig1",
    name: "Default",
    bodyText: "Thanks,\n{{sender.name}}",
    bodyHtml: "<p>Thanks,<br />{{sender.name}}</p>",
    isDefault: true,
    createdBy: "owner@example.com",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    clientId: "c1",
    id: "sig2",
    name: "Short",
    bodyText: "— Support",
    bodyHtml: "<p>— Support</p>",
    isDefault: false,
    createdBy: "owner@example.com",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
];

const snippets: EmailSnippet[] = [
  {
    clientId: "c1",
    id: "sn1",
    name: "Business hours",
    shortcut: "hours",
    bodyText: "We are open 8am–5pm.",
    bodyHtml: "<p>We are open 8am–5pm.</p>",
    createdBy: "owner@example.com",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
];

const library = { templates, signatures, snippets };

const variableContext = {
  lead: { name: "Ada Lovelace", email: "ada@example.com" },
  business: { name: "Acme Hauling" },
  sender: { name: "Sales Team", email: "sales@acme.test" },
};

function renderConnected(
  props: Partial<ComponentProps<typeof LeadEmailThread>> = {},
) {
  return render(
    <LeadEmailThread
      formMessage="Need a quote"
      formFrom="ada@example.com"
      formAt="2026-07-15T12:00:00.000Z"
      messages={[]}
      mailboxConnected
      fromOptions={fromOptions}
      fromAddress="sales@acme.test"
      library={library}
      variableContext={variableContext}
      onSend={vi.fn().mockResolvedValue(undefined)}
      {...props}
    />,
  );
}

async function pickMenuItem(
  user: ReturnType<typeof userEvent.setup>,
  menuLabel: RegExp,
  itemName: RegExp,
) {
  await user.click(screen.getByRole("button", { name: menuLabel }));
  await user.click(screen.getByRole("menuitem", { name: itemName }));
}

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

    renderConnected({ onSend });

    await pickMenuItem(user, /^template$/i, /intro reply/i);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(onSend).toHaveBeenCalledWith(
      expect.stringContaining("Hi Ada, happy to help."),
      expect.any(String),
      { fromIdentityId: "s1" },
    );
  });

  it("disables send when no Sender Display Name is assigned", () => {
    renderConnected({
      fromOptions: [],
      library: { templates: [], signatures: [], snippets: [] },
    });

    expect(
      screen.getByText(/No Sender Display Name assigned/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeDisabled();
  });

  it("disables send when draft is empty", () => {
    renderConnected({
      library: { templates: [], signatures: [], snippets: [] },
    });

    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeDisabled();
  });

  it("styles the send button as white", () => {
    renderConnected({
      library: { templates: [], signatures: [], snippets: [] },
    });

    expect(screen.getByRole("button", { name: /send message/i })).toHaveClass(
      "bg-white",
      "text-background",
    );
  });

  it("segments the timeline by date with a labeled divider", () => {
    const laterDayReply: LeadMessage = {
      clientId: "c1",
      submissionId: "s1",
      messageId: "m2",
      direction: "outbound",
      from: "sales@acme.test",
      to: "ada@example.com",
      subject: "Follow-up",
      bodyText: "Just checking in.",
      createdAt: "2026-07-16T15:00:00.000Z",
      sentBy: "owner@example.com",
    };
    const sameDayReply: LeadMessage = {
      clientId: "c1",
      submissionId: "s1",
      messageId: "m1",
      direction: "outbound",
      from: "sales@acme.test",
      to: "ada@example.com",
      subject: "Re: Need a quote",
      bodyText: "Happy to help.",
      createdAt: "2026-07-15T18:00:00.000Z",
      sentBy: "owner@example.com",
    };

    renderConnected({
      messages: [sameDayReply, laterDayReply],
      library: { templates: [], signatures: [], snippets: [] },
    });

    const dayLabels = screen
      .getAllByRole("time")
      .filter((el) => /^\d{4}-\d{2}-\d{2}$/.test(el.getAttribute("dateTime") ?? ""));
    expect(dayLabels).toHaveLength(2);
    expect(dayLabels[0]).toHaveTextContent(
      new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date("2026-07-15T12:00:00.000Z"),
      ),
    );
    expect(dayLabels[1]).toHaveTextContent(
      new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date("2026-07-16T15:00:00.000Z"),
      ),
    );

    expect(
      screen.getByRole("button", { name: /^Need a quote$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Re: Need a quote$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Follow-up$/i }),
    ).toBeInTheDocument();
  });

  it("shows prevalent timeline icons for each node", () => {
    renderConnected({
      library: { templates: [], signatures: [], snippets: [] },
    });

    expect(screen.getByLabelText(/form submission event/i)).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="timeline-connector"]'),
    ).toBeInTheDocument();
  });

  it("places the event time on the horizontal connector", () => {
    renderConnected({
      library: { templates: [], signatures: [], snippets: [] },
    });

    const connector = document.querySelector(
      '[data-slot="timeline-connector"]',
    );
    expect(connector).not.toBeNull();
    expect(
      within(connector as HTMLElement).getByRole("time"),
    ).toHaveTextContent(
      new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(
        new Date("2026-07-15T12:00:00.000Z"),
      ),
    );
  });

  it("labels sent and received messages with directional arrows", () => {
    const outbound: LeadMessage = {
      clientId: "c1",
      submissionId: "s1",
      messageId: "m1",
      direction: "outbound",
      from: "sales@acme.test",
      to: "customer@gmail.com",
      subject: "Re: Need a quote",
      bodyText: "Happy to help.",
      createdAt: "2026-07-15T18:00:00.000Z",
      sentBy: "owner@example.com",
    };
    const inbound: LeadMessage = {
      clientId: "c1",
      submissionId: "s1",
      messageId: "m2",
      direction: "inbound",
      from: "customer@gmail.com",
      to: "sales@acme.test",
      subject: "Re: Need a quote",
      bodyText: "Thanks!",
      createdAt: "2026-07-15T19:00:00.000Z",
    };

    renderConnected({
      messages: [outbound, inbound],
      library: { templates: [], signatures: [], snippets: [] },
    });

    expect(screen.getByText(/Received ← ada@example\.com/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Sent sales@acme\.test → customer@gmail\.com/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Received ← customer@gmail\.com/i),
    ).toBeInTheDocument();
  });

  it("shows a truncated content preview on closed cards", () => {
    const reply: LeadMessage = {
      clientId: "c1",
      submissionId: "s1",
      messageId: "m1",
      direction: "outbound",
      from: "sales@acme.test",
      to: "ada@example.com",
      subject: "Re: Need a quote",
      bodyText:
        "Happy to help with your quote request. We can schedule a pickup this week if that works for you.",
      createdAt: "2026-07-15T18:00:00.000Z",
    };

    renderConnected({
      messages: [reply],
      library: { templates: [], signatures: [], snippets: [] },
    });

    const preview = document.querySelector(".line-clamp-2");
    expect(preview).toHaveTextContent(/Happy to help with your quote request/i);
    expect(
      screen.getByRole("button", { name: /^Re: Need a quote$/i }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("hides to, from, and date meta rows inside timeline entries", async () => {
    const user = userEvent.setup();
    const reply: LeadMessage = {
      clientId: "c1",
      submissionId: "s1",
      messageId: "m1",
      direction: "outbound",
      from: "sales@acme.test",
      to: "ada@example.com",
      subject: "Re: Need a quote",
      bodyText: "Happy to help.",
      createdAt: "2026-07-15T18:00:00.000Z",
      sentBy: "owner@example.com",
    };

    renderConnected({
      messages: [reply],
      library: { templates: [], signatures: [], snippets: [] },
    });

    await user.click(screen.getByRole("button", { name: /^Re: Need a quote$/i }));

    const body = screen.getByText("Happy to help.");
    expect(body.previousElementSibling).toBeNull();
    expect(body).toHaveClass("whitespace-pre-wrap");
    expect(
      within(body.parentElement as HTMLElement).queryByText(/^from$/i),
    ).not.toBeInTheDocument();
    expect(
      within(body.parentElement as HTMLElement).queryByText(/^to$/i),
    ).not.toBeInTheDocument();
    expect(
      within(body.parentElement as HTMLElement).queryByText(/^date$/i),
    ).not.toBeInTheDocument();
  });

  it("toggles the card when clicking anywhere on it", async () => {
    const user = userEvent.setup();
    const reply: LeadMessage = {
      clientId: "c1",
      submissionId: "s1",
      messageId: "m1",
      direction: "outbound",
      from: "sales@acme.test",
      to: "ada@example.com",
      subject: "Re: Need a quote",
      bodyText: "Happy to help.",
      createdAt: "2026-07-15T18:00:00.000Z",
    };

    renderConnected({
      messages: [reply],
      library: { templates: [], signatures: [], snippets: [] },
    });

    const card = screen.getByRole("button", { name: /^Re: Need a quote$/i });
    expect(card).toHaveAttribute("aria-expanded", "false");

    await user.click(screen.getByText(/Sent sales@acme\.test → ada@example\.com/i));
    expect(card).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByText("Happy to help."));
    expect(card).toHaveAttribute("aria-expanded", "false");
  });

  it("does not toggle while text is selected", async () => {
    const user = userEvent.setup();
    const reply: LeadMessage = {
      clientId: "c1",
      submissionId: "s1",
      messageId: "m1",
      direction: "outbound",
      from: "sales@acme.test",
      to: "ada@example.com",
      subject: "Re: Need a quote",
      bodyText: "Happy to help.",
      createdAt: "2026-07-15T18:00:00.000Z",
    };

    renderConnected({
      messages: [reply],
      library: { templates: [], signatures: [], snippets: [] },
    });

    const card = screen.getByRole("button", { name: /^Re: Need a quote$/i });
    await user.click(card);
    expect(card).toHaveAttribute("aria-expanded", "true");

    const getSelection = vi.spyOn(window, "getSelection").mockReturnValue({
      toString: () => "Happy to help.",
    } as Selection);

    try {
      await user.click(screen.getByText("Happy to help."));
      expect(card).toHaveAttribute("aria-expanded", "true");
    } finally {
      getSelection.mockRestore();
    }
  });

  it("shows message details in an info tooltip on hover", async () => {
    const user = userEvent.setup();
    const reply: LeadMessage = {
      clientId: "c1",
      submissionId: "s1",
      messageId: "m1",
      direction: "outbound",
      from: "sales@acme.test",
      to: "ada@example.com",
      subject: "Re: Need a quote",
      bodyText: "Happy to help.",
      createdAt: "2026-07-15T18:00:00.000Z",
      sentBy: "owner@example.com",
    };

    renderConnected({
      messages: [reply],
      library: { templates: [], signatures: [], snippets: [] },
    });

    await user.hover(
      screen.getByRole("button", { name: /details for re: need a quote/i }),
    );

    expect(await screen.findByRole("tooltip")).toHaveTextContent(/from/i);
    expect(screen.getByRole("tooltip")).toHaveTextContent("sales@acme.test");
    expect(screen.getByRole("tooltip")).toHaveTextContent(/to/i);
    expect(screen.getByRole("tooltip")).toHaveTextContent("ada@example.com");
    expect(screen.getByRole("tooltip")).toHaveTextContent(/date/i);
  });

  it("seeds the default signature into a new reply", async () => {
    renderConnected();

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /reply/i }).textContent,
      ).toContain("Sales Team");
    });
  });

  it("applies a template with merge fields resolved", async () => {
    const user = userEvent.setup();
    renderConnected();

    await pickMenuItem(user, /^template$/i, /intro reply/i);

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /reply/i }).textContent,
      ).toContain("Hi Ada, happy to help.");
    });
    // Default signature stays attached after loading a template.
    expect(
      screen.getByRole("textbox", { name: /reply/i }).textContent,
    ).toContain("Sales Team");
  });

  it("switches the signature without wiping the body", async () => {
    const user = userEvent.setup();
    renderConnected();

    await pickMenuItem(user, /^template$/i, /intro reply/i);
    await pickMenuItem(user, /^signature$/i, /^short$/i);

    const editor = screen.getByRole("textbox", { name: /reply/i });
    await waitFor(() => {
      expect(editor.textContent).toContain("— Support");
    });
    expect(editor.textContent).toContain("Hi Ada, happy to help.");
    expect(editor.textContent).not.toContain("Sales Team");
  });

  it("inserts a snippet from the picker", async () => {
    const user = userEvent.setup();
    renderConnected({
      library: { templates: [], signatures: [], snippets },
    });

    await pickMenuItem(user, /^snippet$/i, /business hours/i);

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /reply/i }).textContent,
      ).toContain("We are open 8am–5pm.");
    });
  });

  it("links to settings when the library is empty", () => {
    renderConnected({
      library: { templates: [], signatures: [], snippets: [] },
    });

    const toolbar = screen.getByRole("toolbar", { name: /formatting/i });
    expect(
      within(toolbar).getByRole("link", { name: /manage in settings/i }),
    ).toHaveAttribute("href", expect.stringMatching(/templates/));
  });

  it("keeps library menus inside the formatting toolbar", () => {
    renderConnected();

    const toolbar = screen.getByRole("toolbar", { name: /formatting/i });
    expect(
      within(toolbar).getByRole("button", { name: /^template$/i }),
    ).toBeInTheDocument();
    expect(
      within(toolbar).getByRole("button", { name: /^snippet$/i }),
    ).toBeInTheDocument();
    expect(
      within(toolbar).getByRole("button", { name: /^signature$/i }),
    ).toBeInTheDocument();
  });
});
