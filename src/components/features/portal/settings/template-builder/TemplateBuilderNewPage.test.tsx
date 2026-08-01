import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TemplateBuilderNewPage } from "./TemplateBuilderNewPage";
import { templateBuilderCreatePath } from "@/lib/portal-settings";

describe("TemplateBuilderNewPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the full-page builder when a starter is selected", async () => {
    const user = userEvent.setup();
    const pushState = vi.spyOn(window.history, "pushState");
    render(<TemplateBuilderNewPage />);

    expect(
      screen.getByRole("dialog", { name: /template gallery/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /one column/i }));

    expect(pushState).toHaveBeenCalledWith(
      null,
      "",
      templateBuilderCreatePath({ starterId: "basic-one-column" }),
    );
  });
});
