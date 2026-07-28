import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RichTextEditor, type RichTextEditorHandle } from "./RichTextEditor";

describe("RichTextEditor", () => {
  it("renders the formatting toolbar", () => {
    render(<RichTextEditor ariaLabel="Reply" onChange={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /bold/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /italic/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /underline/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /bulleted list/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /numbered list/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /link/i }),
    ).toBeInTheDocument();
  });

  it("exposes an accessible editable region with a placeholder", () => {
    render(
      <RichTextEditor
        ariaLabel="Reply"
        placeholder="Type your reply here…"
        onChange={vi.fn()}
      />,
    );

    const editor = screen.getByRole("textbox", { name: /reply/i });
    expect(editor).toHaveAttribute("contenteditable", "true");
    expect(screen.getByText("Type your reply here…")).toBeInTheDocument();
  });

  it("reports content changes as text and html", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RichTextEditor ariaLabel="Reply" onChange={onChange} />);

    const editor = screen.getByRole("textbox", { name: /reply/i });
    await user.click(editor);
    await user.type(editor, "Hello");

    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last.text).toContain("Hello");
    expect(typeof last.html).toBe("string");
  });

  it("opens with existing content and hides the placeholder", () => {
    render(
      <RichTextEditor
        ariaLabel="Body"
        placeholder="Write a message…"
        initialHtml="<p>Saved body</p>"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("textbox", { name: /body/i })).toContainHTML(
      "<p>Saved body</p>",
    );
    expect(screen.queryByText("Write a message…")).not.toBeInTheDocument();
  });

  it("keeps showing the placeholder when initial content is blank", () => {
    render(
      <RichTextEditor
        ariaLabel="Body"
        placeholder="Write a message…"
        initialHtml=""
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Write a message…")).toBeInTheDocument();
  });

  it("disables the toolbar and editor when disabled", () => {
    render(<RichTextEditor ariaLabel="Reply" disabled onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /bold/i })).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: /reply/i }),
    ).toHaveAttribute("contenteditable", "false");
  });

  it("replaces the document through the imperative handle", () => {
    const onChange = vi.fn();
    const ref = createRef<RichTextEditorHandle>();
    render(
      <RichTextEditor ref={ref} ariaLabel="Reply" onChange={onChange} />,
    );

    ref.current?.setHtml("<p>Template body</p>");

    expect(screen.getByRole("textbox", { name: /reply/i })).toContainHTML(
      "<p>Template body</p>",
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining("Template body") }),
    );
  });

  it("inserts html at the current selection through the imperative handle", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const ref = createRef<RichTextEditorHandle>();
    render(
      <RichTextEditor ref={ref} ariaLabel="Reply" onChange={onChange} />,
    );

    const editor = screen.getByRole("textbox", { name: /reply/i });
    await user.click(editor);
    await user.type(editor, "Hello ");
    ref.current?.insertHtml("<strong>world</strong>");

    expect(editor.textContent).toContain("Hello");
    expect(editor.textContent).toContain("world");
    expect(editor.innerHTML).toMatch(/strong/i);
  });
});
