import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuilderBlock } from "./BuilderBlock";
import { createBlockFromVariant } from "@/lib/email-template-document";
import { TB_VARIANT_MIME } from "@/lib/email-template-dnd";

function renderColumnsBlock(overrides?: { selected?: boolean }) {
  const block = createBlockFromVariant("columns-2-50-50");
  if (block.type !== "columns") throw new Error("expected columns");

  const props = {
    block,
    selected: overrides?.selected ?? false,
    onSelect: vi.fn(),
    onChange: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    canMoveUp: true,
    canMoveDown: true,
  };

  return { ...props, ...render(<BuilderBlock {...props} />) };
}

describe("BuilderBlock selection chrome", () => {
  it("keeps the same min-height when a text block becomes editable", async () => {
    const user = userEvent.setup();
    const block = createBlockFromVariant("text-paragraph");
    if (block.type !== "text") throw new Error("expected text");

    const props = {
      block,
      selected: false,
      onSelect: vi.fn(),
      onChange: vi.fn(),
      onDuplicate: vi.fn(),
      onDelete: vi.fn(),
      onMoveUp: vi.fn(),
      onMoveDown: vi.fn(),
      canMoveUp: true,
      canMoveDown: true,
    };

    const { rerender } = render(<BuilderBlock {...props} />);
    const preview = screen.getByTestId("builder-text-preview");
    expect(preview.className).toMatch(/min-h-10/);

    await user.click(screen.getByTestId("builder-block-frame"));
    expect(props.onSelect).toHaveBeenCalled();

    rerender(<BuilderBlock {...props} selected />);
    const editor = screen.getByRole("textbox", { name: /text block/i });
    expect(editor.className).toMatch(/min-h-10/);
    expect(editor.className).not.toMatch(/min-h-40/);
    expect(editor.className).not.toMatch(/min-h-\[3rem\]/);
  });

  it("shows a sharp Section tag and outline when a columns block is selected", () => {
    renderColumnsBlock({ selected: true });

    const tag = screen.getByTestId("builder-block-tag");
    expect(tag).toHaveTextContent("Section");
    expect(tag).toHaveAttribute("data-tb-tag-state", "selected");
    expect(tag.className).not.toMatch(/rounded(?!-none)/);

    const frame = screen.getByTestId("builder-block-frame");
    expect(frame.className).toMatch(/outline/);
    expect(frame.className).toMatch(/rounded-none/);
    expect(frame.className).toMatch(/-mx-10/);
    expect(frame.className).toMatch(/px-10/);
    expect(frame.className).toMatch(/flow-root/);
    expect(frame.className).not.toMatch(/(?:^|\s)p-2(?:\s|$)/);
    expect(frame.className).not.toMatch(/ring-/);
    // Tag sits on the outer outline edge, not inset to the content page.
    expect(tag.className).toMatch(/(?:^|\s)left-0(?:\s|$)/);
    expect(tag.className).not.toMatch(/left-10/);
  });

  it("hovers a section only from the side bleed, not over nested content", async () => {
    const user = userEvent.setup();
    const block = createBlockFromVariant("columns-1-100");
    if (block.type !== "columns") throw new Error("expected columns");
    const withText = {
      ...block,
      columns: ["<p>Hello nested</p>"],
    };
    const onSelect = vi.fn();
    const onSelectColumnItem = vi.fn();

    render(
      <BuilderBlock
        block={withText}
        selected={false}
        onSelect={onSelect}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        canMoveUp
        canMoveDown
        onSelectColumnItem={onSelectColumnItem}
      />,
    );

    expect(screen.queryByTestId("builder-block-tag")).not.toBeInTheDocument();

    await user.hover(screen.getByTestId("builder-column-item-0-0"));
    expect(screen.getByTestId("builder-nested-tag")).toHaveTextContent("Text");
    expect(screen.queryByTestId("builder-block-tag")).not.toBeInTheDocument();

    await user.hover(screen.getByTestId("builder-section-bleed-left"));
    const sectionTag = screen.getByTestId("builder-block-tag");
    expect(sectionTag).toHaveTextContent("Section");
    expect(sectionTag).toHaveAttribute("data-tb-tag-state", "hover");
    expect(screen.queryByTestId("builder-nested-tag")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("builder-section-bleed-right"));
    expect(onSelect).toHaveBeenCalled();
  });

  it("does not mount a text editor in empty columns when the section is selected", () => {
    const block = createBlockFromVariant("columns-2-50-50");
    if (block.type !== "columns") throw new Error("expected columns");

    render(
      <BuilderBlock
        block={block}
        selected
        onSelect={vi.fn()}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        canMoveUp
        canMoveDown
      />,
    );

    expect(
      screen.queryByRole("textbox", { name: /column 1/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: /column 2/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("builder-column-drop-0")).toBeInTheDocument();
    expect(screen.getByTestId("builder-column-drop-1")).toBeInTheDocument();
  });

  it("mounts a text editor only for a selected nested text item", () => {
    const block = createBlockFromVariant("columns-2-50-50");
    if (block.type !== "columns") throw new Error("expected columns");
    const withText = {
      ...block,
      columns: ["<p>Hello nested</p>", block.columns[1]!],
    };

    render(
      <BuilderBlock
        block={withText}
        selected
        selectedColumnItem={{ columnIndex: 0, itemIndex: 0 }}
        onSelect={vi.fn()}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        canMoveUp
        canMoveDown
        onSelectColumnItem={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("textbox", { name: /column 1 text item/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: /^column 1$/i }),
    ).not.toBeInTheDocument();
  });

  it("shows grey column placeholders only while empty, then removes them when content is added", () => {
    const empty = createBlockFromVariant("columns-2-50-50");
    if (empty.type !== "columns") throw new Error("expected columns");

    const { rerender } = render(
      <BuilderBlock
        block={empty}
        selected
        onSelect={vi.fn()}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        canMoveUp
        canMoveDown
      />,
    );

    const column = screen.getByTestId("builder-column-drop-0");
    expect(column.className).toMatch(/bg-zinc-100/);
    expect(column.className).toMatch(/dashed/);
    expect(
      screen.getByRole("button", { name: /delete column 1/i }),
    ).toBeInTheDocument();

    rerender(
      <BuilderBlock
        block={{
          ...empty,
          columns: ["<p>Hello</p>", empty.columns[1]!],
        }}
        selected
        onSelect={vi.fn()}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        canMoveUp
        canMoveDown
      />,
    );

    const filled = screen.getByTestId("builder-column-drop-0");
    expect(filled.className).not.toMatch(/bg-zinc-100/);
    expect(filled.className).not.toMatch(/dashed/);
    expect(
      screen.queryByRole("button", { name: /delete column 1/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("shows a Text tag and outline when hovering or selecting a nested column item", async () => {
    const user = userEvent.setup();
    const block = createBlockFromVariant("columns-2-50-50");
    if (block.type !== "columns") throw new Error("expected columns");
    const withText = {
      ...block,
      columns: ["<p>Hello nested</p>", block.columns[1]!],
    };
    const onSelectColumnItem = vi.fn();
    const props = {
      block: withText,
      selected: true,
      onSelect: vi.fn(),
      onChange: vi.fn(),
      onDuplicate: vi.fn(),
      onDelete: vi.fn(),
      onMoveUp: vi.fn(),
      onMoveDown: vi.fn(),
      canMoveUp: true,
      canMoveDown: true,
      onSelectColumnItem,
    };

    const { rerender } = render(<BuilderBlock {...props} />);

    const item = screen.getByTestId("builder-column-item-0-0");
    expect(screen.queryByTestId("builder-nested-tag")).not.toBeInTheDocument();

    await user.hover(item);
    const hoverTag = screen.getByTestId("builder-nested-tag");
    expect(hoverTag).toHaveTextContent("Text");
    expect(hoverTag).toHaveAttribute("data-tb-tag-state", "hover");
    expect(item.className).toMatch(/outline/);

    await user.click(item);
    expect(onSelectColumnItem).toHaveBeenCalledWith({
      columnIndex: 0,
      itemIndex: 0,
    });

    rerender(
      <BuilderBlock
        {...props}
        selectedColumnItem={{ columnIndex: 0, itemIndex: 0 }}
      />,
    );
    const selectedTag = screen.getByTestId("builder-nested-tag");
    expect(selectedTag).toHaveTextContent("Text");
    expect(selectedTag).toHaveAttribute("data-tb-tag-state", "selected");
    // Nested leaf selection hides parent section chrome.
    expect(screen.queryByTestId("builder-block-tag")).not.toBeInTheDocument();
    expect(screen.getByTestId("builder-block-frame").className).not.toMatch(
      /outline-2/,
    );
  });

  it("shows Insert to Column while dragging over a column", () => {
    const block = createBlockFromVariant("columns-2-50-50");
    if (block.type !== "columns") throw new Error("expected columns");

    render(
      <BuilderBlock
        block={block}
        selected
        onSelect={vi.fn()}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        canMoveUp
        canMoveDown
      />,
    );

    const column = screen.getByTestId("builder-column-drop-0");
    const dataTransfer = {
      types: [TB_VARIANT_MIME, "text/plain"],
      effectAllowed: "copy",
      dropEffect: "copy",
      getData: () => "",
    };

    fireEvent.dragEnter(column, { dataTransfer });
    fireEvent.dragOver(column, { dataTransfer });

    expect(screen.getByTestId("builder-insert-to-column")).toHaveTextContent(
      "Insert to Column",
    );
  });

  it("deletes a column through the grey-box control and removes the section when empty", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onDelete = vi.fn();
    const block = createBlockFromVariant("columns-2-50-50");
    if (block.type !== "columns") throw new Error("expected columns");

    const { rerender } = render(
      <BuilderBlock
        block={block}
        selected
        onSelect={vi.fn()}
        onChange={onChange}
        onDuplicate={vi.fn()}
        onDelete={onDelete}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        canMoveUp
        canMoveDown
      />,
    );

    await user.click(screen.getByRole("button", { name: /delete column 1/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: expect.any(Array),
        columnWidths: [50],
        align: "center",
      }),
    );
    expect(onChange.mock.calls[0]![0].columns).toHaveLength(1);
    expect(onDelete).not.toHaveBeenCalled();

    const next = {
      ...block,
      columns: [block.columns[1]!],
      columnWidths: [50],
      align: "center" as const,
    };
    rerender(
      <BuilderBlock
        block={next}
        selected
        onSelect={vi.fn()}
        onChange={onChange}
        onDuplicate={vi.fn()}
        onDelete={onDelete}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        canMoveUp
        canMoveDown
      />,
    );

    await user.click(screen.getByRole("button", { name: /delete column 1/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
