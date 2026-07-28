import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LeadThreadTabs } from "./LeadThreadTabs";

const tabs = [
  { id: "s1", label: "Ada Lovelace" },
  { id: "s2", label: "Grace Hopper" },
];

describe("LeadThreadTabs", () => {
  it("marks the active tab and calls onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <LeadThreadTabs
        tabs={tabs}
        activeId="s1"
        onSelect={onSelect}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("tab", { name: /ada lovelace/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("tab", { name: /grace hopper/i }),
    ).toHaveAttribute("aria-selected", "false");

    await user.click(screen.getByRole("tab", { name: /grace hopper/i }));
    expect(onSelect).toHaveBeenCalledWith("s2");
  });

  it("closes a tab without selecting it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <LeadThreadTabs
        tabs={tabs}
        activeId="s1"
        onSelect={onSelect}
        onClose={onClose}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /close ada lovelace/i }),
    );
    expect(onClose).toHaveBeenCalledWith("s1");
    expect(onSelect).not.toHaveBeenCalled();
  });
});
