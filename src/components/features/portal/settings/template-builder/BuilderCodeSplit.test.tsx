import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  BuilderCodeSplit,
  formatEmailHtml,
} from "./BuilderCodeSplit";
import {
  appendBlock,
  emptyDocument,
  documentToEmailHtml,
} from "@/lib/email-template-document";

describe("BuilderCodeSplit", () => {
  it("formats email html onto separate lines", () => {
    expect(formatEmailHtml("<div><p>Hi</p></div>")).toBe(
      "<div>\n<p>Hi</p>\n</div>",
    );
  });

  it("shows page preview beside raw html and applies edits", async () => {
    const user = userEvent.setup();
    let doc = emptyDocument();
    doc = appendBlock(doc, "button");
    const onApply = vi.fn();

    render(<BuilderCodeSplit document={doc} onApply={onApply} />);

    expect(screen.getByTestId("builder-code-split")).toBeInTheDocument();
    expect(screen.getByTitle("Template preview")).toBeInTheDocument();
    const editor = screen.getByRole("textbox", { name: /raw html/i });
    expect((editor as HTMLTextAreaElement).value).toContain(
      'data-tb-block="button"',
    );

    const nextHtml =
      '<div data-tb-doc="1"><div data-tb-block="text" data-tb-id="x1"><p>Hello code</p></div></div>';
    fireEvent.change(editor, { target: { value: nextHtml } });
    await user.click(screen.getByRole("button", { name: /^apply$/i }));

    expect(onApply).toHaveBeenCalledTimes(1);
    const applied = onApply.mock.calls[0]![0];
    expect(applied.blocks[0]?.type).toBe("text");
    expect(documentToEmailHtml(applied)).toContain("Hello code");
  });
});
