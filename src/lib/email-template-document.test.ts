import { describe, expect, it } from "vitest";
import {
  appendBlock,
  appendVariant,
  createBlockFromVariant,
  createDefaultBlock,
  DEFAULT_BUTTON_STYLE,
  documentFromStarter,
  documentToEmailHtml,
  documentToPlainText,
  duplicateBlock,
  emptyDocument,
  emptyGridCells,
  insertVariantIntoColumn,
  insertVariantIntoGridCell,
  moveBlock,
  moveBlockIntoColumn,
  moveBlockIntoGridCell,
  parseColumnItems,
  parseDocumentFromHtml,
  removeBlock,
  renderColumnItemInner,
  resizeTable,
  setColumnCount,
  setColumnGap,
  setColumnWidths,
  setColumnItemGap,
  setColumnItemGapBefore,
  setGridColumnWidths,
  setGridGaps,
  setGridRowHeights,
  setGridSize,
  updateColumnItem,
  DEFAULT_IMAGE_STYLE,
  type EmailTemplateDocument,
} from "@/lib/email-template-document";

describe("email-template-document", () => {
  it("creates default blocks for every palette type", () => {
    const types = [
      "text",
      "image",
      "spacer",
      "imageText",
      "button",
      "columns",
      "grid",
      "table",
    ] as const;
    for (const type of types) {
      const block = createDefaultBlock(type);
      expect(block.type).toBe(type);
      expect(block.id).toBeTruthy();
    }
  });

  it("creates blocks from palette variants including 3 columns", () => {
    const three = createBlockFromVariant("columns-3");
    expect(three.type).toBe("columns");
    if (three.type === "columns") {
      expect(three.columns).toHaveLength(3);
    }
    const heading = createBlockFromVariant("text-heading");
    expect(heading.type).toBe("text");
    if (heading.type === "text") {
      expect(heading.html).toContain("h2");
    }
  });

  it("creates a text chip block from a merge-field palette variant", () => {
    const block = createBlockFromVariant("merge-lead.first_name");
    expect(block.type).toBe("text");
    if (block.type !== "text") return;
    expect(block.html).toContain('data-tb-merge="lead.first_name"');
    expect(block.html).toContain("{{lead.first_name}}");

    let doc = emptyDocument();
    doc = appendVariant(doc, "merge-business.name");
    expect(doc.blocks).toHaveLength(1);
    expect(documentToEmailHtml(doc)).toContain("{{business.name}}");
  });

  it("stores imageText as nested image + text children and round-trips them", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "imageText-left");
    const block = doc.blocks[0];
    expect(block?.type).toBe("imageText");
    if (block?.type !== "imageText") return;
    expect(block.image.src).toBe("");
    expect(block.image.alt).toBe("Image");
    expect(block.text.html).toContain("<p>");

    doc = {
      ...doc,
      blocks: [
        {
          ...block,
          image: {
            ...block.image,
            src: "https://cdn.example/photo.png",
            alt: "Photo",
            fit: "fill",
            borderRadius: 8,
          },
          text: { html: "<p>Hello nested</p>" },
          imagePosition: "right",
        },
      ],
    };
    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-src="https://cdn.example/photo.png"');
    expect(html).toContain('data-tb-image-position="right"');
    expect(html).toContain("Hello nested");
    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("imageText");
    if (parsed.blocks[0]?.type !== "imageText") return;
    expect(parsed.blocks[0].image.src).toBe("https://cdn.example/photo.png");
    expect(parsed.blocks[0].image.alt).toBe("Photo");
    expect(parsed.blocks[0].image.fit).toBe("fill");
    expect(parsed.blocks[0].image.borderRadius).toBe(8);
    expect(parsed.blocks[0].text.html).toContain("Hello nested");
    expect(parsed.blocks[0].imagePosition).toBe("right");
  });

  it("round-trips a 3-column block through HTML markers", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-3");
    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-col="2"');
    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("columns");
    if (parsed.blocks[0]?.type === "columns") {
      expect(parsed.blocks[0].columns).toHaveLength(3);
    }
  });

  it("round-trips layout chrome on columns and grid, including 1 column", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-1");
    expect(doc.blocks[0]?.type).toBe("columns");
    if (doc.blocks[0]?.type === "columns") {
      expect(doc.blocks[0].columns).toHaveLength(1);
      expect(doc.blocks[0].align).toBe("left");
    }

    doc = {
      ...doc,
      blocks: doc.blocks.map((block) =>
        block.type === "columns"
          ? {
              ...block,
              backgroundColor: "#fef3c7",
              borderWidth: 2,
              borderColor: "#f59e0b",
              borderRadius: 8,
              paddingX: 12,
              paddingY: 10,
              align: "center",
              cellPadding: 6,
              cellVerticalAlign: "middle",
            }
          : block,
      ),
    };
    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-bg="#fef3c7"');
    expect(html).toContain('data-tb-align="center"');
    expect(html).toContain('data-tb-cell-valign="middle"');
    expect(html).toContain('valign="middle"');
    expect(html).toContain("data-tb-layout-chrome");
    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("columns");
    if (parsed.blocks[0]?.type !== "columns") return;
    expect(parsed.blocks[0].backgroundColor).toBe("#fef3c7");
    expect(parsed.blocks[0].borderWidth).toBe(2);
    expect(parsed.blocks[0].borderRadius).toBe(8);
    expect(parsed.blocks[0].align).toBe("center");
    expect(parsed.blocks[0].cellPadding).toBe(6);
    expect(parsed.blocks[0].cellVerticalAlign).toBe("middle");

    let gridDoc = emptyDocument();
    gridDoc = appendVariant(gridDoc, "grid-2x2");
    gridDoc = {
      ...gridDoc,
      blocks: gridDoc.blocks.map((block) =>
        block.type === "grid"
          ? {
              ...block,
              rows: 8,
              columns: 6,
              cells: emptyGridCells(8, 6),
              backgroundColor: "#e0f2fe",
              align: "right",
              cellVerticalAlign: "bottom",
              borderWidth: 1,
            }
          : block,
      ),
    };
    const gridHtml = documentToEmailHtml(gridDoc);
    const parsedGrid = parseDocumentFromHtml(gridHtml);
    expect(parsedGrid.blocks[0]?.type).toBe("grid");
    if (parsedGrid.blocks[0]?.type !== "grid") return;
    expect(parsedGrid.blocks[0].rows).toBe(8);
    expect(parsedGrid.blocks[0].columns).toBe(6);
    expect(parsedGrid.blocks[0].align).toBe("right");
    expect(parsedGrid.blocks[0].cellVerticalAlign).toBe("bottom");
    expect(parsedGrid.blocks[0].backgroundColor).toBe("#e0f2fe");
  });

  it("round-trips button style properties", () => {
    let doc = emptyDocument();
    doc = appendBlock(doc, "button");
    doc = {
      ...doc,
      blocks: doc.blocks.map((block) =>
        block.type === "button"
          ? {
              ...block,
              backgroundColor: "#11182780",
              textColor: "#fbbf24",
              borderRadius: 16,
              borderColor: "#f59e0b",
              borderWidth: 2,
              paddingX: 28,
              paddingY: 14,
              fontFamily: "Georgia, Times New Roman, serif",
              fontSize: 18,
              fontWeight: "700",
            }
          : block,
      ),
    };
    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-bg="#11182780"');
    expect(html).toContain("rgba(17, 24, 39, 0.5)");
    expect(html).toContain('data-tb-radius="16"');
    expect(html).toContain("border-radius:16px");
    expect(html).toContain('data-tb-font-size="18"');
    expect(html).toContain("font-weight:700");
    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("button");
    if (parsed.blocks[0]?.type === "button") {
      expect(parsed.blocks[0].backgroundColor).toBe("#11182780");
      expect(parsed.blocks[0].textColor).toBe("#fbbf24");
      expect(parsed.blocks[0].borderRadius).toBe(16);
      expect(parsed.blocks[0].borderWidth).toBe(2);
      expect(parsed.blocks[0].paddingX).toBe(28);
      expect(parsed.blocks[0].fontSize).toBe(18);
      expect(parsed.blocks[0].fontWeight).toBe("700");
      expect(parsed.blocks[0].fontFamily).toContain("Georgia");
    }
  });

  it("round-trips a document through HTML markers", () => {
    let doc = emptyDocument("#eeeeee");
    doc = appendBlock(doc, "text");
    doc = appendBlock(doc, "button");
    doc = appendBlock(doc, "columns");
    doc = {
      ...doc,
      blocks: doc.blocks.map((block) => {
        if (block.type === "text") {
          return { ...block, html: "<p>Hello {{lead.first_name}}</p>" };
        }
        if (block.type === "button") {
          return {
            ...block,
            label: "Book now",
            href: "https://example.com",
            align: "center" as const,
          };
        }
        return block;
      }),
    };

    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-doc="1"');
    expect(html).toContain('data-tb-block="text"');
    expect(html).toContain("Book now");

    const parsed = parseDocumentFromHtml(html);
    expect(parsed.backgroundColor).toBe("#eeeeee");
    expect(parsed.blocks).toHaveLength(3);
    expect(parsed.blocks[0]?.type).toBe("text");
    expect(parsed.blocks[0] && "html" in parsed.blocks[0] && parsed.blocks[0].html).toContain(
      'data-tb-merge="lead.first_name"',
    );
    expect(parsed.blocks[0] && "html" in parsed.blocks[0] && parsed.blocks[0].html).toContain(
      "{{lead.first_name}}",
    );
    expect(parsed.blocks[1]?.type).toBe("button");
    if (parsed.blocks[1]?.type === "button") {
      expect(parsed.blocks[1].label).toBe("Book now");
      expect(parsed.blocks[1].href).toBe("https://example.com");
    }
    expect(parsed.blocks[2]?.type).toBe("columns");
  });

  it("extracts plain text from blocks", () => {
    const doc: EmailTemplateDocument = {
      backgroundColor: "#fff",
      blocks: [
        { id: "1", type: "text", html: "<p>Hi there</p>", width: null, height: null },
        {
          id: "2",
          type: "button",
          label: "Click",
          href: "https://x.test",
          align: "center",
          ...DEFAULT_BUTTON_STYLE,
          width: null,
          height: null,
        },
      ],
    };
    expect(documentToPlainText(doc)).toContain("Hi there");
    expect(documentToPlainText(doc)).toContain("Click");
  });

  it("wraps legacy HTML without markers as a freeform html block", () => {
    const parsed = parseDocumentFromHtml("<p>Old template</p>");
    expect(parsed.blocks).toHaveLength(1);
    expect(parsed.blocks[0]?.type).toBe("html");
    if (parsed.blocks[0]?.type === "html") {
      expect(parsed.blocks[0].html).toContain("Old template");
    }
  });

  it("converts gallery starters into documents", () => {
    const blank = documentFromStarter({
      id: "basic-blank",
      bodyHtml: "<p><br /></p>",
      bodyText: "",
    });
    expect(blank.blocks).toHaveLength(0);

    const columns = documentFromStarter({
      id: "basic-two-column",
      bodyHtml: "<p>x</p>",
      bodyText: "x",
    });
    expect(columns.blocks[0]?.type).toBe("columns");

    const reply = documentFromStarter({
      id: "followup-check-in",
      bodyHtml: "<p>Hi {{lead.first_name}}</p>",
      bodyText: "Hi {{lead.first_name}}",
    });
    expect(reply.blocks[0]?.type).toBe("text");
  });

  it("duplicates, removes, and reorders blocks", () => {
    let doc = emptyDocument();
    doc = appendBlock(doc, "text");
    doc = appendBlock(doc, "spacer");
    const firstId = doc.blocks[0]!.id;

    doc = duplicateBlock(doc, firstId);
    expect(doc.blocks).toHaveLength(3);
    expect(doc.blocks[1]?.type).toBe("text");
    expect(doc.blocks[1]?.id).not.toBe(firstId);

    doc = moveBlock(doc, firstId, "down");
    expect(doc.blocks[1]?.id).toBe(firstId);

    doc = removeBlock(doc, firstId);
    expect(doc.blocks.every((b) => b.id !== firstId)).toBe(true);
  });

  it("defaults table headers to a grey background", () => {
    const table = createDefaultBlock("table");
    expect(table.type).toBe("table");
    if (table.type === "table") {
      expect(table.headerBackgroundColor).toBe("#e4e4e7");
      expect(table.fontFamily).toBeTruthy();
      expect(table.fontSize).toBe(14);
    }
    let doc = emptyDocument();
    doc = appendBlock(doc, "table");
    const html = documentToEmailHtml(doc);
    expect(html).toContain("background:#e4e4e7");
    expect(html).toContain('data-tb-header-bg="#e4e4e7"');
  });

  it("round-trips table style properties", () => {
    let doc = emptyDocument();
    doc = appendBlock(doc, "table");
    doc = {
      ...doc,
      blocks: doc.blocks.map((block) =>
        block.type === "table"
          ? {
              ...block,
              headerBackgroundColor: "#cbd5e1",
              headerTextColor: "#0f172a",
              cellBackgroundColor: "#f8fafc",
              cellTextColor: "#334155",
              borderColor: "#94a3b8",
              fontFamily: "Georgia, Times New Roman, serif",
              fontSize: 16,
              headerFontWeight: "700",
              cellPadding: 12,
            }
          : block,
      ),
    };
    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-header-bg="#cbd5e1"');
    expect(html).toContain("font-size:16px");
    expect(html).toContain("background:#cbd5e1");
    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("table");
    if (parsed.blocks[0]?.type === "table") {
      expect(parsed.blocks[0].headerBackgroundColor).toBe("#cbd5e1");
      expect(parsed.blocks[0].headerTextColor).toBe("#0f172a");
      expect(parsed.blocks[0].cellBackgroundColor).toBe("#f8fafc");
      expect(parsed.blocks[0].cellTextColor).toBe("#334155");
      expect(parsed.blocks[0].borderColor).toBe("#94a3b8");
      expect(parsed.blocks[0].fontFamily).toContain("Georgia");
      expect(parsed.blocks[0].fontSize).toBe(16);
      expect(parsed.blocks[0].headerFontWeight).toBe("700");
      expect(parsed.blocks[0].cellPadding).toBe(12);
    }
  });

  it("resizes columns and table grids", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-2");
    const columnsId = doc.blocks[0]!.id;
    doc = setColumnCount(doc, columnsId, 4);
    expect(doc.blocks[0]?.type).toBe("columns");
    if (doc.blocks[0]?.type === "columns") {
      expect(doc.blocks[0].columns).toHaveLength(4);
    }
    doc = setColumnCount(doc, columnsId, 2);
    if (doc.blocks[0]?.type === "columns") {
      expect(doc.blocks[0].columns).toHaveLength(2);
    }

    doc = appendVariant(doc, "table-2x2");
    const tableId = doc.blocks[1]!.id;
    doc = resizeTable(doc, tableId, { rowCount: 4, columnCount: 3 });
    expect(doc.blocks[1]?.type).toBe("table");
    if (doc.blocks[1]?.type === "table") {
      expect(doc.blocks[1].rows).toHaveLength(4);
      expect(doc.blocks[1].rows[0]).toHaveLength(3);
      expect(doc.blocks[1].rows[0]![2]).toBe("Header 3");
      expect(doc.blocks[1].rows[3]![0]).toBe("Cell");
    }
  });

  it("inserts a palette variant into a column cell as HTML", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-2");
    const columnsId = doc.blocks[0]!.id;
    doc = insertVariantIntoColumn(doc, columnsId, 0, "image-single");
    expect(doc.blocks).toHaveLength(1);
    if (doc.blocks[0]?.type === "columns") {
      expect(doc.blocks[0].columns[0]).toMatch(/img|Add image|Image/i);
    }
    doc = insertVariantIntoColumn(doc, columnsId, 1, "button-center");
    if (doc.blocks[0]?.type === "columns") {
      expect(doc.blocks[0].columns[1]).toContain("Click here");
    }
  });

  it("moves an existing block into a column cell", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-2");
    doc = appendVariant(doc, "image-single");
    const columnsId = doc.blocks[0]!.id;
    const imageId = doc.blocks[1]!.id;
    doc = {
      ...doc,
      blocks: doc.blocks.map((block) =>
        block.type === "image"
          ? { ...block, src: "https://cdn.example/box.png", alt: "Box" }
          : block,
      ),
    };
    doc = moveBlockIntoColumn(doc, imageId, columnsId, 0);
    expect(doc.blocks).toHaveLength(1);
    if (doc.blocks[0]?.type === "columns") {
      expect(doc.blocks[0].columns[0]).toContain("https://cdn.example/box.png");
      expect(doc.blocks[0].columns[0]).toContain("Box");
    }
  });

  it("round-trips width and height on sized blocks", () => {
    let doc = emptyDocument();
    doc = appendBlock(doc, "text");
    doc = appendBlock(doc, "image");
    doc = {
      ...doc,
      blocks: doc.blocks.map((block) => {
        if (block.type === "text") {
          return { ...block, width: 420, height: 160 };
        }
        if (block.type === "image") {
          return { ...block, width: 300, height: 200 };
        }
        return block;
      }),
    };
    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-width="420"');
    expect(html).toContain('data-tb-height="160"');
    expect(html).toContain("width:420px");
    expect(html).toContain("min-height:160px");
    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("text");
    if (parsed.blocks[0]?.type === "text") {
      expect(parsed.blocks[0].width).toBe(420);
      expect(parsed.blocks[0].height).toBe(160);
    }
    if (parsed.blocks[1]?.type === "image") {
      expect(parsed.blocks[1].width).toBe(300);
      expect(parsed.blocks[1].height).toBe(200);
    }
  });

  it("adds horizontal gutter spacing between columns in email html", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-2");
    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-column-gap="24"');
    expect(html).toMatch(/padding:0px 24px 0px 0px/);
    expect(html).not.toMatch(/padding:0px 0px 0px 24px/);
  });

  it("updates the gap between columns via setColumnGap", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-2");
    const columnsId = doc.blocks[0]!.id;
    doc = setColumnGap(doc, columnsId, 40);

    const columns = doc.blocks[0];
    expect(columns?.type).toBe("columns");
    if (columns?.type !== "columns") return;
    expect(columns.columnGap).toBe(40);

    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-column-gap="40"');
    expect(html).toMatch(/padding:0px 40px 0px 0px/);

    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("columns");
    if (parsed.blocks[0]?.type === "columns") {
      expect(parsed.blocks[0].columnGap).toBe(40);
    }
  });

  it("truncates empty image placeholders instead of overflowing", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "image-single");
    const html = documentToEmailHtml(doc);
    expect(html).toContain("Add image URL");
    expect(html).toContain("overflow:hidden");
    expect(html).toContain("text-overflow:ellipsis");
    expect(html).toContain("white-space:nowrap");

    const itemHtml = renderColumnItemInner({
      kind: "image",
      src: "",
      alt: "Image",
      ...DEFAULT_IMAGE_STYLE,
      gapBefore: null,
    });
    expect(itemHtml).toContain("overflow:hidden");
    expect(itemHtml).toContain("text-overflow:ellipsis");
  });

  it("supports document background image and content background color", () => {
    let doc = emptyDocument();
    doc = {
      ...doc,
      backgroundColor: "#111827",
      backgroundImage: "https://cdn.example/bg.jpg",
      backgroundSize: "cover",
      backgroundPosition: "center",
      contentBackgroundColor: "#fef3c7",
    };
    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-bg="#111827"');
    expect(html).toContain('data-tb-bg-image="https://cdn.example/bg.jpg"');
    expect(html).toContain('data-tb-bg-size="cover"');
    expect(html).toContain('data-tb-bg-position="center"');
    expect(html).toContain('data-tb-content-bg="#fef3c7"');
    expect(html).toContain("background-image:url(https://cdn.example/bg.jpg)");
    expect(html).toContain("background-size:cover");
    expect(html).toContain("background:#fef3c7");

    const parsed = parseDocumentFromHtml(html);
    expect(parsed.backgroundColor).toBe("#111827");
    expect(parsed.backgroundImage).toBe("https://cdn.example/bg.jpg");
    expect(parsed.backgroundSize).toBe("cover");
    expect(parsed.backgroundPosition).toBe("center");
    expect(parsed.contentBackgroundColor).toBe("#fef3c7");
  });

  it("round-trips page margins and header/footer bands", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "header-basic");
    doc = appendVariant(doc, "footer-links");
    doc = appendVariant(doc, "text-paragraph");
    doc = {
      ...doc,
      pageMarginTop: 40,
      pageMarginRight: 16,
      pageMarginBottom: 32,
      pageMarginLeft: 20,
      header: doc.header
        ? {
            ...doc.header,
            html: "<p>Acme Co</p>",
            backgroundColor: "#f4f4f5",
            paddingY: 16,
            borderWidth: 2,
            borderColor: "#a1a1aa",
            align: "center",
          }
        : null,
      footer: doc.footer
        ? {
            ...doc.footer,
            paddingX: 8,
            align: "center",
          }
        : null,
    };

    expect(doc.blocks).toHaveLength(1);
    expect(doc.header).not.toBeNull();
    expect(doc.footer).not.toBeNull();

    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-margin="40,16,32,20"');
    expect(html).toContain("padding:40px 16px 32px 20px");
    expect(html).toContain('data-tb-header="1"');
    expect(html).toContain('data-tb-footer="1"');
    expect(html).toContain("Acme Co");
    expect(html).toContain("Unsubscribe");

    const parsed = parseDocumentFromHtml(html);
    expect(parsed.pageMarginTop).toBe(40);
    expect(parsed.pageMarginRight).toBe(16);
    expect(parsed.pageMarginBottom).toBe(32);
    expect(parsed.pageMarginLeft).toBe(20);
    expect(parsed.header?.html).toContain("Acme Co");
    expect(parsed.header?.align).toBe("center");
    expect(parsed.header?.borderWidth).toBe(2);
    expect(parsed.footer?.html).toMatch(/Unsubscribe/i);
    expect(parsed.blocks).toHaveLength(1);

    // Adding header again is a no-op singleton.
    const again = appendVariant(parsed, "header-logo");
    expect(again.header?.html).toContain("Acme Co");
  });

  it("supports image link, radius, padding, and border options", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "image-single");
    const imageId = doc.blocks[0]!.id;
    doc = {
      ...doc,
      blocks: doc.blocks.map((block) =>
        block.id === imageId && block.type === "image"
          ? {
              ...block,
              src: "https://cdn.example/photo.png",
              href: "https://example.com",
              openInNewTab: true,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#2563eb",
              paddingX: 8,
              paddingY: 12,
            }
          : block,
      ),
    };

    const html = documentToEmailHtml(doc);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain("border-radius:12px");
    expect(html).toContain("border:2px solid");
    expect(html).toContain("padding:12px 8px");
    expect(html).toContain('data-tb-href="https://example.com"');
    expect(html).toContain('data-tb-radius="12"');

    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("image");
    if (parsed.blocks[0]?.type === "image") {
      expect(parsed.blocks[0].href).toBe("https://example.com");
      expect(parsed.blocks[0].openInNewTab).toBe(true);
      expect(parsed.blocks[0].borderRadius).toBe(12);
      expect(parsed.blocks[0].borderWidth).toBe(2);
      expect(parsed.blocks[0].paddingX).toBe(8);
      expect(parsed.blocks[0].paddingY).toBe(12);
    }
  });

  it("supports image fit modes for email and column items", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "image-single");
    const imageId = doc.blocks[0]!.id;
    doc = {
      ...doc,
      blocks: doc.blocks.map((block) =>
        block.id === imageId && block.type === "image"
          ? {
              ...block,
              src: "https://cdn.example/square.png",
              fit: "fill",
            }
          : block,
      ),
    };

    let html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-fit="fill"');
    expect(html).toContain("width:100%");

    doc = {
      ...doc,
      blocks: doc.blocks.map((block) =>
        block.id === imageId && block.type === "image"
          ? { ...block, fit: "fit", align: "center" }
          : block,
      ),
    };
    html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-fit="fit"');
    expect(html).toContain('data-tb-align="center"');
    expect(html).toContain("text-align:center");
    expect(html).toContain("width:auto");
    expect(html).toContain("max-width:100%");

    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("image");
    if (parsed.blocks[0]?.type === "image") {
      expect(parsed.blocks[0].fit).toBe("fit");
      expect(parsed.blocks[0].align).toBe("center");
    }

    const fillItem = renderColumnItemInner({
      kind: "image",
      src: "https://cdn.example/a.png",
      alt: "A",
      ...DEFAULT_IMAGE_STYLE,
      fit: "fill",
      gapBefore: null,
    });
    expect(fillItem).toContain("width:100%");
    const fitItem = renderColumnItemInner({
      kind: "image",
      src: "https://cdn.example/a.png",
      alt: "A",
      ...DEFAULT_IMAGE_STYLE,
      fit: "fit",
      align: "right",
      gapBefore: null,
    });
    expect(fitItem).toContain("width:auto");
    expect(fitItem).toContain("text-align:right");
  });

  it("supports uneven column width percentages", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-3");
    const columnsId = doc.blocks[0]!.id;

    const defaults = doc.blocks[0];
    expect(defaults?.type).toBe("columns");
    if (defaults?.type !== "columns") return;
    expect(defaults.columnWidths).toBeNull();

    const autoHtml = documentToEmailHtml(doc);
    expect(autoHtml).not.toContain("data-tb-column-widths");
    expect(autoHtml).toContain('width="33%"');
    expect(autoHtml).toContain('width="34%"');

    doc = setColumnWidths(doc, columnsId, [50, 25, 25]);
    const columns = doc.blocks[0];
    expect(columns?.type).toBe("columns");
    if (columns?.type !== "columns") return;
    expect(columns.columnWidths).toEqual([50, 25, 25]);

    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-column-widths="50,25,25"');
    expect(html).toContain('width="50%"');
    expect(html).toContain('width="25%"');

    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("columns");
    if (parsed.blocks[0]?.type === "columns") {
      expect(parsed.blocks[0].columnWidths).toEqual([50, 25, 25]);
    }

    doc = setColumnCount(doc, columnsId, 2);
    const shrunk = doc.blocks[0];
    if (shrunk?.type !== "columns") return;
    expect(shrunk.columnWidths).toHaveLength(2);
    expect(shrunk.columnWidths!.reduce((sum, w) => sum + w, 0)).toBe(100);

    doc = setColumnWidths(doc, columnsId, null);
    const autoAgain = doc.blocks[0];
    if (autoAgain?.type !== "columns") return;
    expect(autoAgain.columnWidths).toBeNull();
  });

  it("spaces stacked column items evenly and supports uneven gaps", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-2");
    const columnsId = doc.blocks[0]!.id;
    doc = {
      ...doc,
      blocks: doc.blocks.map((block) =>
        block.type === "columns" ? { ...block, itemGap: 16 } : block,
      ),
    };
    doc = insertVariantIntoColumn(doc, columnsId, 0, "image-single");
    doc = insertVariantIntoColumn(doc, columnsId, 0, "button-center");

    const columns = doc.blocks[0];
    expect(columns?.type).toBe("columns");
    if (columns?.type !== "columns") return;

    const items = parseColumnItems(columns.columns[0] ?? "");
    expect(items).toHaveLength(2);
    expect(items[0]?.kind).toBe("image");
    expect(items[1]?.kind).toBe("button");
    expect(columns.columns[0]).toContain("data-tb-col-item");
    expect(columns.columns[0]).toContain('data-tb-item-kind="button"');
    expect(columns.columns[0]).toContain("padding-top:16px");

    doc = setColumnItemGapBefore(doc, columnsId, 0, 1, 40);
    const updated = doc.blocks[0];
    if (updated?.type !== "columns") return;
    expect(updated.columns[0]).toContain('data-tb-gap-before="40"');
    expect(updated.columns[0]).toContain("padding-top:40px");

    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-item-gap="16"');
    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("columns");
    if (parsed.blocks[0]?.type === "columns") {
      expect(parsed.blocks[0].itemGap).toBe(16);
      expect(parsed.blocks[0].columns[0]).toContain('data-tb-gap-before="40"');
      const roundTripped = parseColumnItems(parsed.blocks[0].columns[0] ?? "");
      expect(roundTripped[0]?.kind).toBe("image");
      expect(roundTripped[1]?.kind).toBe("button");
      if (roundTripped[1]?.kind === "button") {
        expect(roundTripped[1].label).toBe("Click here");
      }
    }
  });

  it("applies default item spacing as padding between stacked column items", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-2");
    const columnsId = doc.blocks[0]!.id;
    doc = insertVariantIntoColumn(doc, columnsId, 0, "image-single");
    doc = insertVariantIntoColumn(doc, columnsId, 0, "button-center");
    doc = setColumnItemGap(doc, columnsId, 28);

    const columns = doc.blocks[0];
    expect(columns?.type).toBe("columns");
    if (columns?.type !== "columns") return;
    expect(columns.itemGap).toBe(28);
    expect(columns.columns[0]).toContain("padding-top:28px");
    expect(columns.columns[0]).not.toContain("margin-top:28px");

    const html = documentToEmailHtml(doc);
    expect(html).toContain("padding-top:28px");
  });

  it("updates a nested column item", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "columns-2");
    const columnsId = doc.blocks[0]!.id;
    doc = insertVariantIntoColumn(doc, columnsId, 0, "image-single");
    const before = parseColumnItems(
      doc.blocks[0]?.type === "columns" ? (doc.blocks[0].columns[0] ?? "") : "",
    );
    expect(before).toHaveLength(1);
    expect(before[0]?.kind).toBe("image");

    doc = updateColumnItem(doc, columnsId, 0, 0, {
      src: "https://cdn.example/hero.png",
      alt: "Hero",
    });
    const colHtml =
      doc.blocks[0]?.type === "columns" ? (doc.blocks[0].columns[0] ?? "") : "";
    expect(colHtml).toContain("https://cdn.example/hero.png");
    const items = parseColumnItems(colHtml);
    expect(items).toHaveLength(1);
    expect(items[0]?.kind).toBe("image");
    if (items[0]?.kind === "image") {
      expect(items[0].src).toBe("https://cdn.example/hero.png");
      expect(items[0].alt).toBe("Hero");
    }
  });

  it("creates grid blocks from palette variants", () => {
    const twoByTwo = createBlockFromVariant("grid-2x2");
    expect(twoByTwo.type).toBe("grid");
    if (twoByTwo.type !== "grid") return;
    expect(twoByTwo.rows).toBe(2);
    expect(twoByTwo.columns).toBe(2);
    expect(twoByTwo.cells).toHaveLength(4);
    expect(twoByTwo.columnWidths).toBeNull();
    expect(twoByTwo.rowHeights).toBeNull();
    expect(twoByTwo.columnGap).toBe(16);
    expect(twoByTwo.rowGap).toBe(16);
    expect(twoByTwo.itemGap).toBe(12);
    expect(twoByTwo.cellPadding).toBe(0);

    const threeByThree = createBlockFromVariant("grid-3x3");
    expect(threeByThree.type).toBe("grid");
    if (threeByThree.type === "grid") {
      expect(threeByThree.cells).toHaveLength(9);
    }
  });

  it("round-trips a grid block through HTML markers with gaps and widths", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "grid-2x2");
    const gridId = doc.blocks[0]!.id;
    doc = setGridSize(doc, gridId, { rows: 2, columns: 3 });
    doc = setGridColumnWidths(doc, gridId, [40, 30, 30]);
    doc = setGridRowHeights(doc, gridId, [60, 40]);
    doc = setGridGaps(doc, gridId, {
      columnGap: 20,
      rowGap: 12,
      itemGap: 8,
      cellPadding: 6,
    });
    doc = insertVariantIntoGridCell(doc, gridId, 0, 1, "button-center");

    const html = documentToEmailHtml(doc);
    expect(html).toContain('data-tb-block="grid"');
    expect(html).toContain('data-tb-rows="2"');
    expect(html).toContain('data-tb-cols="3"');
    expect(html).toContain('data-tb-column-gap="20"');
    expect(html).toContain('data-tb-row-gap="12"');
    expect(html).toContain('data-tb-item-gap="8"');
    expect(html).toContain('data-tb-cell-pad="6"');
    expect(html).toContain('data-tb-column-widths="40,30,30"');
    expect(html).toContain('data-tb-row-heights="60,40"');
    expect(html).toContain('data-tb-grid-row="0"');
    expect(html).toContain('data-tb-grid-col="1"');
    expect(html).toContain("padding:6px 26px 18px 6px");
    expect(html).toContain("Click here");

    const parsed = parseDocumentFromHtml(html);
    expect(parsed.blocks[0]?.type).toBe("grid");
    if (parsed.blocks[0]?.type !== "grid") return;
    expect(parsed.blocks[0].rows).toBe(2);
    expect(parsed.blocks[0].columns).toBe(3);
    expect(parsed.blocks[0].cells).toHaveLength(6);
    expect(parsed.blocks[0].columnWidths).toEqual([40, 30, 30]);
    expect(parsed.blocks[0].rowHeights).toEqual([60, 40]);
    expect(parsed.blocks[0].columnGap).toBe(20);
    expect(parsed.blocks[0].rowGap).toBe(12);
    expect(parsed.blocks[0].itemGap).toBe(8);
    expect(parsed.blocks[0].cellPadding).toBe(6);
    const items = parseColumnItems(parsed.blocks[0].cells[1] ?? "");
    expect(items.some((item) => item.kind === "button")).toBe(true);
  });

  it("resizes grid and preserves overlapping cells", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "grid-2x2");
    const gridId = doc.blocks[0]!.id;
    doc = insertVariantIntoGridCell(doc, gridId, 1, 1, "text-heading");
    doc = setGridSize(doc, gridId, { rows: 3, columns: 3 });
    const expanded = doc.blocks[0];
    expect(expanded?.type).toBe("grid");
    if (expanded?.type !== "grid") return;
    expect(expanded.cells).toHaveLength(9);
    expect(parseColumnItems(expanded.cells[4] ?? "")[0]?.kind).toBe("text");

    doc = setGridSize(doc, gridId, { rows: 1, columns: 2 });
    const shrunk = doc.blocks[0];
    if (shrunk?.type !== "grid") return;
    expect(shrunk.cells).toHaveLength(2);
  });

  it("moves a top-level block into a grid cell", () => {
    let doc = emptyDocument();
    doc = appendVariant(doc, "grid-2x2");
    doc = appendVariant(doc, "image-single");
    const gridId = doc.blocks[0]!.id;
    const imageId = doc.blocks[1]!.id;
    doc = {
      ...doc,
      blocks: doc.blocks.map((block) =>
        block.id === imageId && block.type === "image"
          ? { ...block, src: "https://cdn.example/g.png", alt: "Grid img" }
          : block,
      ),
    };
    doc = moveBlockIntoGridCell(doc, imageId, gridId, 0, 0);
    expect(doc.blocks).toHaveLength(1);
    if (doc.blocks[0]?.type !== "grid") return;
    expect(doc.blocks[0].cells[0]).toContain("https://cdn.example/g.png");
  });
});
