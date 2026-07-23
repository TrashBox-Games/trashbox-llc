import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeadStatusBadge } from "./LeadStatusBadge";

describe("LeadStatusBadge", () => {
  it("renders the status label with a white glowing dot for New", () => {
    render(<LeadStatusBadge status="new" />);

    const badge = screen.getByRole("status", { name: /status: new/i });
    expect(within(badge).getByText("New")).toBeInTheDocument();
    const dot = badge.querySelector("[aria-hidden='true']");
    expect(dot).toHaveClass("bg-white");
    expect(dot).toHaveClass("shadow-[0_0_8px_2px_rgba(255,255,255,0.65)]");
  });

  it("uses a distinct color for each status", () => {
    const { rerender } = render(<LeadStatusBadge status="contacted" />);
    expect(
      screen
        .getByRole("status", { name: /contacted/i })
        .querySelector("[aria-hidden='true']"),
    ).toHaveClass("bg-[#7EB6D4]");

    rerender(<LeadStatusBadge status="qualified" />);
    expect(
      screen
        .getByRole("status", { name: /qualified/i })
        .querySelector("[aria-hidden='true']"),
    ).toHaveClass("bg-[#D4B87E]");

    rerender(<LeadStatusBadge status="won" />);
    expect(
      screen
        .getByRole("status", { name: /won/i })
        .querySelector("[aria-hidden='true']"),
    ).toHaveClass("bg-[#8FCB8F]");

    rerender(<LeadStatusBadge status="lost" />);
    expect(
      screen
        .getByRole("status", { name: /lost/i })
        .querySelector("[aria-hidden='true']"),
    ).toHaveClass("bg-error");
  });
});
