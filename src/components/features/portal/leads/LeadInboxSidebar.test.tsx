import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Submission } from "@/lib/api";
import {
  INBOX_SIDEBAR_DEFAULT_WIDTH,
  INBOX_SIDEBAR_MAX_WIDTH,
  INBOX_SIDEBAR_MIN_WIDTH,
  LeadInboxResizeHandle,
  LeadInboxSidebar,
  LeadInboxSidebarToggle,
  resolveInboxSidebarSnap,
} from "./LeadInboxSidebar";

const items: Submission[] = [
  {
    clientId: "c1",
    submissionId: "s1",
    senderName: "Ada Lovelace",
    senderEmail: "ada@example.com",
    message: "Need a quote for a new site",
    submittedAt: "2026-07-15T12:00:00.000Z",
    status: "new",
    messageCount: 0,
  },
  {
    clientId: "c1",
    submissionId: "s2",
    senderName: "Grace Hopper",
    senderEmail: "grace@example.com",
    message: "Follow up on inspection",
    submittedAt: "2026-07-16T09:00:00.000Z",
    status: "contacted",
    messageCount: 1,
  },
];

const emptyFilters = {
  q: "",
  status: "" as const,
  tag: "" as const,
  assignedTo: "",
};

const baseProps = {
  filters: emptyFilters,
  members: [] as [],
  onFiltersChange: vi.fn(),
  onApplyFilters: vi.fn(),
  items,
  selectedId: "s1",
  onSelect: vi.fn(),
  listBusy: false,
  listError: null as string | null,
};

describe("LeadInboxSidebar", () => {
  it("renders filters and vertical lead cards when open", () => {
    render(
      <LeadInboxSidebar open onOpenChange={vi.fn()} {...baseProps} />,
    );

    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /hide leads panel/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ada lovelace/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /grace hopper/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("inbox-sidebar-panel")).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  it("collapses the panel when closed without a show control", () => {
    render(
      <LeadInboxSidebar open={false} onOpenChange={vi.fn()} {...baseProps} />,
    );

    expect(
      screen.queryByRole("button", { name: /show leads panel/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("inbox-sidebar-panel")).toHaveAttribute(
      "data-state",
      "closed",
    );
    expect(screen.getByTestId("inbox-sidebar-panel")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("toggles closed via the hide icon", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <LeadInboxSidebar open onOpenChange={onOpenChange} {...baseProps} />,
    );

    await user.click(
      screen.getByRole("button", { name: /hide leads panel/i }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("LeadInboxSidebarToggle opens the panel when closed", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <LeadInboxSidebarToggle open={false} onOpenChange={onOpenChange} />,
    );

    await user.click(
      screen.getByRole("button", { name: /show leads panel/i }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("calls onSelect when a lead card is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <LeadInboxSidebar
        open
        onOpenChange={vi.fn()}
        {...baseProps}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: /grace hopper/i }));
    expect(onSelect).toHaveBeenCalledWith("s2");
  });

  it("calls onLoadMore when load more is clicked", async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();

    render(
      <LeadInboxSidebar
        open
        onOpenChange={vi.fn()}
        {...baseProps}
        hasMore
        onLoadMore={onLoadMore}
      />,
    );

    await user.click(screen.getByRole("button", { name: /load more/i }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not render a resize handle on the sidebar", () => {
    render(
      <LeadInboxSidebar open onOpenChange={vi.fn()} {...baseProps} />,
    );

    expect(
      screen.queryByRole("separator", { name: /resize/i }),
    ).not.toBeInTheDocument();
  });
});

describe("resolveInboxSidebarSnap", () => {
  it("snaps closed below the collapse threshold", () => {
    expect(resolveInboxSidebarSnap(120)).toEqual({
      open: false,
      width: INBOX_SIDEBAR_DEFAULT_WIDTH,
    });
  });

  it("snaps to nearby width stops", () => {
    expect(resolveInboxSidebarSnap(330)).toEqual({
      open: true,
      width: INBOX_SIDEBAR_DEFAULT_WIDTH,
    });
    expect(resolveInboxSidebarSnap(250)).toEqual({
      open: true,
      width: INBOX_SIDEBAR_MIN_WIDTH,
    });
    expect(resolveInboxSidebarSnap(500)).toEqual({
      open: true,
      width: INBOX_SIDEBAR_MAX_WIDTH,
    });
  });

  it("clamps when not near a snap point", () => {
    expect(resolveInboxSidebarSnap(400)).toEqual({
      open: true,
      width: 400,
    });
  });
});

describe("LeadInboxResizeHandle", () => {
  it("updates sidebar width when dragged", () => {
    const onWidthChange = vi.fn();

    render(
      <LeadInboxResizeHandle width={320} onWidthChange={onWidthChange} />,
    );

    const handle = screen.getByRole("separator", {
      name: /resize email panel/i,
    });

    fireEvent.pointerDown(handle, { clientX: 320, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 400, pointerId: 1 });
    fireEvent.pointerUp(handle, { pointerId: 1 });

    expect(onWidthChange).toHaveBeenCalled();
    const last = onWidthChange.mock.calls.at(-1)?.[0] as number;
    expect(last).toBeGreaterThan(320);
  });

  it("snaps closed when released past the collapse threshold", () => {
    const onWidthChange = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <LeadInboxResizeHandle
        width={320}
        onWidthChange={onWidthChange}
        onOpenChange={onOpenChange}
      />,
    );

    const handle = screen.getByRole("separator", {
      name: /resize email panel/i,
    });

    fireEvent.pointerDown(handle, { clientX: 320, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerUp(handle, { pointerId: 1 });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onWidthChange).toHaveBeenCalledWith(INBOX_SIDEBAR_DEFAULT_WIDTH);
  });

  it("snaps to the default width when released nearby", () => {
    const onWidthChange = vi.fn();

    render(
      <LeadInboxResizeHandle width={320} onWidthChange={onWidthChange} />,
    );

    const handle = screen.getByRole("separator", {
      name: /resize email panel/i,
    });

    fireEvent.pointerDown(handle, { clientX: 320, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 340, pointerId: 1 });
    fireEvent.pointerUp(handle, { pointerId: 1 });

    expect(onWidthChange).toHaveBeenLastCalledWith(INBOX_SIDEBAR_DEFAULT_WIDTH);
  });

  it("nudges width with arrow keys and applies snap", async () => {
    const user = userEvent.setup();
    const onWidthChange = vi.fn();

    render(
      <LeadInboxResizeHandle width={320} onWidthChange={onWidthChange} />,
    );

    const handle = screen.getByRole("separator", {
      name: /resize email panel/i,
    });
    handle.focus();
    await user.keyboard("{ArrowRight}");
    // 336 is within snap distance of 320
    expect(onWidthChange).toHaveBeenCalledWith(INBOX_SIDEBAR_DEFAULT_WIDTH);

    await user.keyboard("{ArrowLeft}");
    expect(onWidthChange).toHaveBeenCalledWith(INBOX_SIDEBAR_DEFAULT_WIDTH);
  });
});
