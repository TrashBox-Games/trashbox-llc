import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmailPlanTiers } from "./EmailPlanTiers";

describe("EmailPlanTiers", () => {
  it("renders a CTA under each plan card", () => {
    render(<EmailPlanTiers />);

    expect(
      screen.getByRole("link", { name: /get started/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /choose solo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /choose team/i }),
    ).toBeInTheDocument();
  });

  it("calls onSelectPlan for paid tiers in portal mode", async () => {
    const user = userEvent.setup();
    const onSelectPlan = vi.fn();

    render(
      <EmailPlanTiers
        currentPlan="free"
        onSelectPlan={onSelectPlan}
      />,
    );

    expect(
      screen.getByRole("button", { name: /current plan/i }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /choose team/i }));
    expect(onSelectPlan).toHaveBeenCalledWith("team");
  });
});
