import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BuilderPreview } from "./BuilderPreview";
import { appendBlock, emptyDocument } from "@/lib/email-template-document";

describe("BuilderPreview", () => {
  it("renders the email on a grey stage so the content page stands out", () => {
    let doc = emptyDocument();
    doc = appendBlock(doc, "text");

    render(<BuilderPreview document={doc} />);

    const iframe = screen.getByTitle("Template preview") as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain("background:#e8e8ec");
    expect(iframe.srcdoc).toContain('data-tb-doc="1"');
    expect(iframe.className).toMatch(/bg-zinc-100|bg-\[#e8e8ec\]/);
  });
});
