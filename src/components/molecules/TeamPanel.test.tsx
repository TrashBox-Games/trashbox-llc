import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { TeamMember } from "@/lib/api";
import { TeamPanel } from "./TeamPanel";

const owner: TeamMember = {
  email: "owner@example.com",
  role: "owner",
  joinedAt: "2026-01-01T00:00:00.000Z",
  emailNotifications: true,
};

const member: TeamMember = {
  email: "sarah@example.com",
  role: "member",
  joinedAt: "2026-02-01T00:00:00.000Z",
  firstName: "Sarah",
  lastName: "Chen",
  emailNotifications: false,
  allowedFromIdentityIds: ["s1"],
  defaultFromIdentityId: "s1",
};

const catalog = [
  {
    id: "s1",
    name: "Sales Team",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "s2",
    name: "Support",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("TeamPanel", () => {
  it("invites with first and last name", async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn().mockResolvedValue(undefined);

    render(
      <TeamPanel
        role="owner"
        currentUserEmail="owner@example.com"
        members={[owner]}
        invites={[]}
        senderDisplayNames={catalog}
        memberLimit={5}
        memberCount={1}
        onInvite={onInvite}
        onRevokeInvite={vi.fn()}
        onRemoveMember={vi.fn()}
        onUpdateMember={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/^email$/i), "new@example.com");
    await user.type(screen.getByLabelText(/first name/i), "New");
    await user.type(screen.getByLabelText(/last name/i), "Hire");
    await user.click(screen.getByRole("button", { name: /send invite/i }));

    expect(onInvite).toHaveBeenCalledWith({
      email: "new@example.com",
      firstName: "New",
      lastName: "Hire",
      emailNotifications: true,
    });
  });

  it("lets owners assign allowed and default Sender Display Names", async () => {
    const user = userEvent.setup();
    const onUpdateMember = vi.fn().mockResolvedValue(undefined);

    render(
      <TeamPanel
        role="owner"
        currentUserEmail="owner@example.com"
        members={[owner, member]}
        invites={[]}
        senderDisplayNames={catalog}
        memberLimit={5}
        memberCount={2}
        onInvite={vi.fn()}
        onRevokeInvite={vi.fn()}
        onRemoveMember={vi.fn()}
        onUpdateMember={onUpdateMember}
      />,
    );

    const editButtons = screen.getAllByRole("button", { name: /edit profile/i });
    await user.click(editButtons[1]!);
    await user.click(screen.getByRole("checkbox", { name: /Support/i }));
    await user.selectOptions(
      screen.getByLabelText(/Default Sender Display Name/i),
      "s2",
    );
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(onUpdateMember).toHaveBeenCalledWith(
      "sarah@example.com",
      expect.objectContaining({
        allowedFromIdentityIds: ["s1", "s2"],
        defaultFromIdentityId: "s2",
      }),
    );
  });

  it("shows first and last name in the member list", () => {
    render(
      <TeamPanel
        role="owner"
        currentUserEmail="owner@example.com"
        members={[owner, member]}
        invites={[]}
        senderDisplayNames={catalog}
        memberLimit={5}
        memberCount={2}
        onInvite={vi.fn()}
        onRevokeInvite={vi.fn()}
        onRemoveMember={vi.fn()}
        onUpdateMember={vi.fn()}
      />,
    );

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
  });
});
