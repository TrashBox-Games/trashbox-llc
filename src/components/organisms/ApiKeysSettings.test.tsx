import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiKeysSettings } from "./ApiKeysSettings";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    getAccount: vi.fn(),
    createApiKey: vi.fn(),
    deleteApiKey: vi.fn(),
  };
});

import { createApiKey, deleteApiKey, getAccount } from "@/lib/api";

describe("ApiKeysSettings", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(getAccount).mockResolvedValue({
      linked: true,
      email: "owner@example.com",
      clientName: "Acme",
      tier: "basic",
      active: true,
      hasBilling: false,
      hasApiKey: false,
      role: "owner",
    });
  });

  it("fetches account and lets owners create a key", async () => {
    vi.mocked(createApiKey).mockResolvedValue({
      apiKey: "fapi_created",
      hasApiKey: true,
      message: "Save this API key now — it will not be shown again.",
    });

    const user = userEvent.setup();
    render(<ApiKeysSettings />);

    expect(
      await screen.findByRole("heading", { name: /no key issued/i }),
    ).toBeInTheDocument();
    await waitFor(() => expect(getAccount).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: /create key/i }));
    expect(createApiKey).toHaveBeenCalled();
    expect(await screen.findByText("fapi_created")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /key active/i })).toBeInTheDocument();
  });

  it("lets owners delete an active key after confirm", async () => {
    vi.mocked(getAccount).mockResolvedValue({
      linked: true,
      email: "owner@example.com",
      clientName: "Acme",
      tier: "basic",
      active: true,
      hasBilling: false,
      hasApiKey: true,
      role: "owner",
    });
    vi.mocked(deleteApiKey).mockResolvedValue({
      hasApiKey: false,
      message: "API key deleted",
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const user = userEvent.setup();
    render(<ApiKeysSettings />);

    expect(
      await screen.findByRole("heading", { name: /key active/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /delete key/i }));
    expect(deleteApiKey).toHaveBeenCalled();
    expect(
      await screen.findByRole("heading", { name: /no key issued/i }),
    ).toBeInTheDocument();
  });

  it("blocks members from managing keys", async () => {
    vi.mocked(getAccount).mockResolvedValue({
      linked: true,
      email: "member@example.com",
      role: "member",
      hasApiKey: true,
    });

    render(<ApiKeysSettings />);

    expect(
      await screen.findByText(/only owners and admins can manage api keys/i),
    ).toBeInTheDocument();
  });
});
