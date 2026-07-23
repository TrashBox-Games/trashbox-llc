import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LeadDetail } from "./LeadDetail";

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
