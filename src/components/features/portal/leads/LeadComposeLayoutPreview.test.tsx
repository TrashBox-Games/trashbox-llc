import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LeadComposeLayoutPreview } from "./LeadComposeLayoutPreview";

describe("LeadComposeLayoutPreview", () => {
  it("renders the layout HTML and edit/remove controls", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(
      <LeadComposeLayoutPreview
        html="<p>Hello layout</p>"
        signatureHtml="<p>Thanks</p>"
        onEdit={onEdit}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByTitle("Layout preview")).toBeInTheDocument();
    expect(screen.getByLabelText(/reply signature/i).innerHTML).toContain(
      "Thanks",
    );

    await user.click(screen.getByRole("button", { name: /edit layout/i }));
    await user.click(screen.getByRole("button", { name: /remove layout/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
