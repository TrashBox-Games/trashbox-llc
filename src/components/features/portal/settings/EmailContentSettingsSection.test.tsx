import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/components/ui/sonner";
import { EmailContentSettingsSection } from "./EmailContentSettingsSection";

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    listEmailTemplates: vi.fn(),
    createEmailTemplate: vi.fn(),
    updateEmailTemplate: vi.fn(),
    deleteEmailTemplate: vi.fn(),
    listEmailSignatures: vi.fn(),
    updateEmailSignature: vi.fn(),
    listEmailSnippets: vi.fn(),
  };
});

import {
  ApiError,
  createEmailTemplate,
  deleteEmailTemplate,
  listEmailSignatures,
  listEmailSnippets,
  listEmailTemplates,
  updateEmailSignature,
  type EmailSignature,
  type EmailTemplate,
} from "@/lib/api";

const template: EmailTemplate = {
  clientId: "c1",
  id: "t1",
  name: "Quote follow-up",
  subject: "Your quote",
  bodyText: "Hi there",
  createdBy: "owner@example.com",
  createdAt: "2026-07-20T10:00:00.000Z",
  updatedAt: "2026-07-20T10:00:00.000Z",
};

const signatures: EmailSignature[] = [
  {
    clientId: "c1",
    id: "g1",
    name: "Sales sign-off",
    bodyText: "Thanks, Sales",
    isDefault: true,
    createdBy: "owner@example.com",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
  },
  {
    clientId: "c1",
    id: "g2",
    name: "Support sign-off",
    bodyText: "Thanks, Support",
    isDefault: false,
    createdBy: "owner@example.com",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
  },
];

describe("EmailContentSettingsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(toast.success).mockClear();
    vi.mocked(listEmailTemplates).mockResolvedValue({
      items: [template],
      canManage: true,
    });
    vi.mocked(listEmailSignatures).mockResolvedValue({
      items: signatures,
      canManage: true,
    });
    vi.mocked(listEmailSnippets).mockResolvedValue({
      items: [],
      canManage: false,
    });
  });

  it("loads templates on mount", async () => {
    render(<EmailContentSettingsSection kind="template" />);

    expect(await screen.findByText("Quote follow-up")).toBeInTheDocument();
    expect(listEmailTemplates).toHaveBeenCalledTimes(1);
  });

  it("renders from initialState without calling the API", () => {
    render(
      <EmailContentSettingsSection
        kind="template"
        initialState={{ items: [template], canManage: false }}
      />,
    );

    expect(screen.getByText("Quote follow-up")).toBeInTheDocument();
    expect(listEmailTemplates).not.toHaveBeenCalled();
  });

  it("links New template to the builder route", async () => {
    render(<EmailContentSettingsSection kind="template" />);

    await screen.findByText("Quote follow-up");
    expect(
      screen.getByRole("link", { name: /new template/i }),
    ).toHaveAttribute("href", expect.stringMatching(/templates\/new\/?$/));
  });

  it("duplicates a template through the create API", async () => {
    vi.mocked(createEmailTemplate).mockResolvedValue({
      ...template,
      id: "t2",
      name: "Quote follow-up (copy)",
    });
    const user = userEvent.setup();
    render(<EmailContentSettingsSection kind="template" />);

    await screen.findByText("Quote follow-up");
    await user.click(screen.getByRole("button", { name: /duplicate/i }));

    await waitFor(() =>
      expect(createEmailTemplate).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Quote follow-up (copy)" }),
      ),
    );
    expect(listEmailTemplates).toHaveBeenCalledTimes(2);
    expect(toast.success).toHaveBeenCalledWith("Template saved.");
    expect(screen.queryByText(/template saved/i)).not.toBeInTheDocument();
  });

  it("shows the API message when a write fails", async () => {
    vi.mocked(createEmailTemplate).mockRejectedValue(
      new ApiError(400, "Shortcut /hours is already in use"),
    );
    const user = userEvent.setup();
    render(<EmailContentSettingsSection kind="template" />);

    await screen.findByText("Quote follow-up");
    await user.click(screen.getByRole("button", { name: /duplicate/i }));

    expect(
      await screen.findByText("Shortcut /hours is already in use"),
    ).toBeInTheDocument();
  });

  it("deletes a template after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(deleteEmailTemplate).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<EmailContentSettingsSection kind="template" />);

    await screen.findByText("Quote follow-up");
    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => expect(deleteEmailTemplate).toHaveBeenCalledWith("t1"));
  });

  it("promotes a signature to the account default", async () => {
    vi.mocked(updateEmailSignature).mockResolvedValue({
      ...signatures[1]!,
      isDefault: true,
    });
    const user = userEvent.setup();
    render(<EmailContentSettingsSection kind="signature" />);

    await screen.findByText("Support sign-off");
    await user.click(screen.getByRole("button", { name: /make default/i }));

    await waitFor(() =>
      expect(updateEmailSignature).toHaveBeenCalledWith("g2", {
        isDefault: true,
      }),
    );
  });

  it("reports a failed load instead of an empty list", async () => {
    vi.mocked(listEmailSnippets).mockRejectedValue(
      new ApiError(503, "Service unavailable"),
    );

    render(<EmailContentSettingsSection kind="snippet" />);

    expect(await screen.findByText("Service unavailable")).toBeInTheDocument();
  });
});
