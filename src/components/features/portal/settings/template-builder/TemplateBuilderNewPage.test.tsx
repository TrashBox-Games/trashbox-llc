import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TemplateBuilderNewPage } from "./TemplateBuilderNewPage";
import { templateBuilderCreatePath } from "@/lib/portal-settings";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("TemplateBuilderNewPage", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("opens the full-page builder when a starter is selected", async () => {
    const user = userEvent.setup();
    render(<TemplateBuilderNewPage />);

    expect(
      screen.getByRole("dialog", { name: /template gallery/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /one column/i }));

    expect(push).toHaveBeenCalledWith(
      templateBuilderCreatePath({ starterId: "basic-one-column" }),
    );
  });
});
