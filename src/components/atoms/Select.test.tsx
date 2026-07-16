import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
];

describe("Select", () => {
  it("shows the selected label and calls onChange when an option is chosen", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <div>
        <label htmlFor="status">Status</label>
        <Select
          id="status"
          value="new"
          options={options}
          onChange={onChange}
        />
      </div>,
    );

    const trigger = screen.getByRole("button", { name: /status/i });
    expect(trigger).toHaveTextContent("New");

    await user.click(trigger);
    const listbox = screen.getByRole("listbox");
    await user.click(within(listbox).getByRole("option", { name: /contacted/i }));

    expect(onChange).toHaveBeenCalledWith("contacted");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes on Escape without changing the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        aria-label="Tag"
        value=""
        options={options}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /tag/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();

    render(
      <Select
        aria-label="Assignee"
        value=""
        options={options}
        onChange={vi.fn()}
        disabled
      />,
    );

    await user.click(screen.getByRole("button", { name: /assignee/i }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
