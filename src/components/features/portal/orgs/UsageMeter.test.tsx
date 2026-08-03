import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsageMeter } from "./UsageMeter";

describe("UsageMeter", () => {
  it("renders used and limit with a progressbar", () => {
    render(
      <UsageMeter
        label="Seats"
        used={2}
        limit={5}
        ariaLabel="Team member seats"
      />,
    );

    expect(screen.getByText(/^Seats$/i)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
    const bar = screen.getByRole("progressbar", {
      name: /team member seats/i,
    });
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
  });
});
