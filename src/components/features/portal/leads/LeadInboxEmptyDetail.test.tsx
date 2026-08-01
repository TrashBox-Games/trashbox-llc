import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeadInboxEmptyDetail } from "./LeadInboxEmptyDetail";

describe("LeadInboxEmptyDetail", () => {
  it("shows the empty inbox graphic and copy in the detail pane", () => {
    render(<LeadInboxEmptyDetail />);

    expect(
      screen.getByRole("img", { name: /empty inbox/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /inbox is clear/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/form submissions will show up here/i),
    ).toBeInTheDocument();
  });

  it("explains a filtered empty list when filtered", () => {
    render(<LeadInboxEmptyDetail filtered />);

    expect(
      screen.getByRole("heading", { name: /no matching leads/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/try clearing filters/i)).toBeInTheDocument();
  });

  it("prompts to select a lead when the list has items", () => {
    render(<LeadInboxEmptyDetail variant="select" />);

    expect(
      screen.getByRole("heading", { name: /select a lead/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/choose a submission from the list/i),
    ).toBeInTheDocument();
  });
});
