import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RichTextEditor, type RichTextEditorHandle } from "./RichTextEditor";

describe("RichTextEditor", () => {
  it("renders the core formatting toolbar", () => {
    render(<RichTextEditor ariaLabel="Reply" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /^bold$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^italic$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^underline$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /strikethrough/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /bulleted list/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /numbered list/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^link$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clear formatting/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /blockquote/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /insert image/i }),
    ).toBeInTheDocument();
  });

  it("exposes font, size, color, align, indent and emoji menus", () => {
    render(<RichTextEditor ariaLabel="Reply" onChange={vi.fn()} />);

    const font = screen.getByRole("button", { name: /^font$/i });
    expect(font).toBeInTheDocument();
    expect(font).toHaveTextContent("Arial");

    const fontSize = screen.getByRole("button", { name: /^font size$/i });
    expect(fontSize).toBeInTheDocument();
    expect(fontSize).toHaveTextContent("14");

    expect(
      screen.getByRole("button", { name: /^text color$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^highlight$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^align$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /decrease indent/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /increase indent/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^emoji$/i })).toBeInTheDocument();
  });

  it("opens the font menu when the font trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor ariaLabel="Reply" onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /^font$/i }));
    expect(
      await screen.findByRole("menuitem", { name: /georgia/i }),
    ).toBeInTheDocument();
  });

  it("applies a preset or custom font size from the size picker", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor ariaLabel="Reply" onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /^font size$/i }));
    expect(await screen.findByRole("spinbutton", { name: /custom font size/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /18 pixels/i }));
    expect(screen.getByRole("button", { name: /^font size$/i })).toHaveTextContent(
      "18",
    );

    await user.click(screen.getByRole("button", { name: /^font size$/i }));
    const custom = await screen.findByRole("spinbutton", {
      name: /custom font size/i,
    });
    await user.clear(custom);
    await user.type(custom, "22");
    await user.click(screen.getByRole("button", { name: /^apply$/i }));
    expect(screen.getByRole("button", { name: /^font size$/i })).toHaveTextContent(
      "22",
    );
  });

  it("offers hex rgb hsl and hsv color format tabs", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor ariaLabel="Reply" onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /^text color$/i }));
    expect(
      await screen.findByLabelText(/text color color picker/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tablist", { name: /text color color format/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /^hex$/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("textbox", { name: /text color hex color/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /^rgb$/i }));
    expect(screen.getByRole("spinbutton", { name: /text color r/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /text color g/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /text color b/i })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /^hsl$/i }));
    expect(screen.getByRole("spinbutton", { name: /text color h/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /text color s/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /text color l/i })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /^hsv$/i }));
    expect(screen.getByRole("spinbutton", { name: /text color h/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /text color s/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /text color v/i })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /text color #e53935/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^confirm$/i }),
    ).toBeInTheDocument();
  });

  it("shows an inline color picker under format fields and above presets", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor ariaLabel="Reply" onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /^text color$/i }));
    const hex = await screen.findByRole("textbox", {
      name: /text color hex color/i,
    });
    const picker = screen.getByLabelText(/text color color picker/i);
    const preset = screen.getByRole("button", { name: /text color #e53935/i });

    expect(hex.compareDocumentPosition(picker) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      picker.compareDocumentPosition(preset) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.click(preset);
    expect(screen.getByLabelText(/text color color picker/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^confirm$/i }));
    expect(
      screen.queryByLabelText(/text color color picker/i),
    ).not.toBeInTheDocument();
  });

  it("renders toolbarStart and toolbarEnd slots", () => {
    render(
      <RichTextEditor
        ariaLabel="Reply"
        onChange={vi.fn()}
        toolbarStart={<button type="button">Templates</button>}
        toolbarEnd={<button type="button">Extra end</button>}
      />,
    );

    const toolbar = screen.getByRole("toolbar", { name: /formatting/i });
    expect(toolbar).toContainElement(
      screen.getByRole("button", { name: /^templates$/i }),
    );
    expect(toolbar).toContainElement(
      screen.getByRole("button", { name: /^extra end$/i }),
    );
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

    expect(screen.getByRole("button", { name: /^bold$/i })).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: /reply/i }),
    ).toHaveAttribute("contenteditable", "false");
  });

  it("invokes strikethrough and clear formatting without throwing", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor ariaLabel="Reply" onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /strikethrough/i }));
    await user.click(screen.getByRole("button", { name: /clear formatting/i }));
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
