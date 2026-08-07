import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MenuToggleIcon } from "./MenuToggleIcon";

describe("MenuToggleIcon", () => {
  it("renders three bars in the closed state", () => {
    const { container } = render(<MenuToggleIcon open={false} />);

    const icon = container.querySelector("[data-menu-toggle-icon]");
    expect(icon).toHaveAttribute("data-open", "false");
    expect(icon?.querySelectorAll("[data-bar]")).toHaveLength(3);
  });

  it("marks open state for the animated X", () => {
    const { container } = render(<MenuToggleIcon open />);

    expect(
      container.querySelector("[data-menu-toggle-icon]"),
    ).toHaveAttribute("data-open", "true");
  });
});
