import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { EmailTemplate } from "@/lib/api";
import { LeadEmailThreadSection } from "./LeadEmailThreadSection";

const listEmailTemplates = vi.fn();
const listEmailSignatures = vi.fn();
const listEmailSnippets = vi.fn();

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    listEmailTemplates: (...args: unknown[]) => listEmailTemplates(...args),
    listEmailSignatures: (...args: unknown[]) => listEmailSignatures(...args),
    listEmailSnippets: (...args: unknown[]) => listEmailSnippets(...args),
  };
});

const template: EmailTemplate = {
  clientId: "c1",
  id: "t1",
  name: "Intro reply",
  subject: "Hello",
  bodyText: "Hi there",
  bodyHtml: "<p>Hi there</p>",
  createdBy: "owner@example.com",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

describe("LeadEmailThreadSection", () => {
  beforeEach(() => {
    listEmailTemplates.mockReset();
    listEmailSignatures.mockReset();
    listEmailSnippets.mockReset();
  });

  it("loads the content library when the mailbox is connected", async () => {
    listEmailTemplates.mockResolvedValue({ items: [template], canManage: true });
    listEmailSignatures.mockResolvedValue({ items: [], canManage: true });
    listEmailSnippets.mockResolvedValue({ items: [], canManage: true });

    render(
      <LeadEmailThreadSection
        formMessage="Need a quote"
        formFrom="ada@example.com"
        formAt="2026-07-15T12:00:00.000Z"
        featuredBody="Need a quote"
        messages={[]}
        mailboxConnected
        fromOptions={[
          {
            id: "s1",
            label: "Sales Team (Default)",
            displayName: "Sales Team",
          },
        ]}
        onSend={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(listEmailTemplates).toHaveBeenCalled();
    });
    expect(listEmailSignatures).toHaveBeenCalled();
    expect(listEmailSnippets).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /template/i })).toBeInTheDocument();
  });

  it("skips the network when an initial library is provided", () => {
    render(
      <LeadEmailThreadSection
        formMessage="Need a quote"
        formFrom="ada@example.com"
        formAt="2026-07-15T12:00:00.000Z"
        featuredBody="Need a quote"
        messages={[]}
        mailboxConnected
        initialLibrary={{
          templates: [template],
          signatures: [],
          snippets: [],
        }}
        fromOptions={[]}
        onSend={vi.fn()}
      />,
    );

    expect(listEmailTemplates).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /template/i })).toBeInTheDocument();
  });
});
