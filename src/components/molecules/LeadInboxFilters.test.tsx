import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LeadInboxFilters } from "./LeadInboxFilters";
import { LeadDetail } from "./LeadDetail";
import { TeamPanel } from "./TeamPanel";

describe("LeadInboxFilters", () => {
  it("submits filter values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onApply = vi.fn();

    render(
      <LeadInboxFilters
        value={{ q: "", status: "", tag: "", assignedTo: "" }}
        members={[{ email: "sarah@example.com", role: "member", joinedAt: "2026-01-01" }]}
        onChange={onChange}
        onApply={onApply}
      />,
    );

    await user.type(screen.getByLabelText(/search/i), "estimate");
    expect(onChange).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /apply filters/i }));
    expect(onApply).toHaveBeenCalled();
  });
});

describe("LeadDetail", () => {
  it("changes status and adds a note", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const onAddNote = vi.fn().mockResolvedValue(undefined);

    render(
      <LeadDetail
        submission={{
          clientId: "c1",
          submissionId: "s1",
          senderName: "Ada",
          senderEmail: "ada@example.com",
          message: "Need a quote",
          submittedAt: "2026-07-15T12:00:00.000Z",
          status: "new",
          tags: [],
          notes: [],
          assignedTo: null,
        }}
        members={[{ email: "sarah@example.com", role: "member", joinedAt: "2026-01-01" }]}
        onUpdate={onUpdate}
        onAddNote={onAddNote}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/^status$/i), "contacted");
    expect(onUpdate).toHaveBeenCalledWith({ status: "contacted" });

    await user.type(
      screen.getByLabelText(/add note/i),
      "Called customer July 15, requested estimate",
    );
    await user.click(screen.getByRole("button", { name: /save note/i }));
    expect(onAddNote).toHaveBeenCalledWith(
      "Called customer July 15, requested estimate",
    );
  });
});

describe("TeamPanel", () => {
  it("lets owners invite teammates", async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn().mockResolvedValue(undefined);

    render(
      <TeamPanel
        role="owner"
        members={[{ email: "owner@example.com", role: "owner", joinedAt: "2026-01-01" }]}
        invites={[]}
        onInvite={onInvite}
        onRevokeInvite={vi.fn()}
        onRemoveMember={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/^email$/i), "teammate@example.com");
    await user.click(screen.getByRole("button", { name: /send invite/i }));
    expect(onInvite).toHaveBeenCalledWith("teammate@example.com");
  });
});
