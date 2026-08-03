import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeatUsageMeter } from "./SeatUsageMeter";

describe("SeatUsageMeter", () => {
  it("renders seats used and limit with a progressbar", () => {
    render(<SeatUsageMeter used={1} limit={5} />);

    expect(screen.getByText(/^Seats$/i)).toBeInTheDocument();
    const bar = screen.getByRole("progressbar", {
      name: /team member seats/i,
    });
    expect(bar).toHaveAttribute("aria-valuenow", "1");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
  });
});
