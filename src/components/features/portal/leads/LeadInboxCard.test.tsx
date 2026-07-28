import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  inboxCardStackDepth,
  LeadInboxCard,
} from "./LeadInboxCard";

describe("inboxCardStackDepth", () => {
  it("is a single card when there are no replies", () => {
    expect(inboxCardStackDepth(0)).toBe(1);
  });

  it("stacks two cards for one reply", () => {
    expect(inboxCardStackDepth(1)).toBe(2);
  });

  it("caps at three cards (one on top, two below)", () => {
    expect(inboxCardStackDepth(2)).toBe(3);
    expect(inboxCardStackDepth(9)).toBe(3);
  });
});

describe("LeadInboxCard", () => {
  const base = {
    senderName: "Ada Lovelace",
    senderEmail: "ada@example.com",
    message: "Need a quote for a new site",
    submittedAt: "2026-07-15T12:00:00.000Z",
    status: "new" as const,
    active: false,
    replyCount: 0,
    onSelect: vi.fn(),
  };

  it("renders lead summary content", () => {
    render(<LeadInboxCard {...base} />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(
      screen.getByText("Need a quote for a new site"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: /status: new/i }),
    ).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<LeadInboxCard {...base} onSelect={onSelect} />);

    await user.click(
      screen.getByRole("button", { name: /ada lovelace/i }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("shows no stack layers without replies", () => {
    render(<LeadInboxCard {...base} replyCount={0} />);

    expect(screen.queryByTestId("inbox-card-stack")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-stack-depth",
      "1",
    );
  });

  it("shows one stack layer under the card for a single reply", () => {
    render(<LeadInboxCard {...base} replyCount={1} />);

    const stack = screen.getByTestId("inbox-card-stack");
    expect(stack).toHaveAttribute("data-stack-behind", "1");
    expect(stack.className).toMatch(/\bpl-2\b/);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-stack-depth",
      "2",
    );
    expect(screen.getByRole("button").getAttribute("style") ?? "").toContain(
      "* -1)",
    );
  });

  it("shows two stack layers under the card for multiple replies", () => {
    render(<LeadInboxCard {...base} replyCount={5} />);

    const stack = screen.getByTestId("inbox-card-stack");
    expect(stack).toHaveAttribute("data-stack-behind", "2");
    expect(stack.className).toMatch(/\bpl-4\b/);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-stack-depth",
      "3",
    );
    expect(screen.getByRole("button").getAttribute("style") ?? "").toContain(
      "* -2)",
    );
  });

  it("shows assignee when provided", () => {
    render(<LeadInboxCard {...base} assignedTo="owner@example.com" />);

    expect(screen.getByText(/assigned: owner@example.com/i)).toBeInTheDocument();
  });
});
