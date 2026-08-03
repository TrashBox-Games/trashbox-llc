import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubmissionUsageMeter } from "./SubmissionUsageMeter";

describe("SubmissionUsageMeter", () => {
  it("renders used and limit with a progressbar", () => {
    render(<SubmissionUsageMeter used={3} limit={10} />);

    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
    const bar = screen.getByRole("progressbar", {
      name: /monthly form submissions/i,
    });
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemax", "10");
  });
});
