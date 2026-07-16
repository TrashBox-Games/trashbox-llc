import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortalApp } from "./PortalPage";
import { PlatformNav } from "./PlatformNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/platform/",
}));

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  getAccount: vi.fn(),
  listSubmissions: vi.fn(),
  provisionAccount: vi.fn(),
  createApiKey: vi.fn(),
  deleteApiKey: vi.fn(),
  startCheckout: vi.fn(),
  openBillingPortal: vi.fn(),
}));

vi.mock("@/components/atoms/FadeIn", () => ({
  FadeIn: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

import { useAuth } from "@/lib/auth";
import {
  createApiKey,
  deleteApiKey,
  getAccount,
  listSubmissions,
} from "@/lib/api";

describe("PlatformNav", () => {
  it("links Features under /platform and Login to portal", () => {
    render(<PlatformNav />);

    expect(screen.getByRole("link", { name: /^login$/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/portal\/login\/?$/),
    );
    expect(screen.getByRole("link", { name: /^features$/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/platform\/features\/?$/),
    );
  });
});

describe("PortalApp API key tab", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      configured: true,
      status: "signedIn",
      email: "owner@example.com",
      signInWithPassword: vi.fn(),
      signUpWithPassword: vi.fn(),
      confirmSignUpCode: vi.fn(),
      resendCode: vi.fn(),
      signOutUser: vi.fn(),
    } as ReturnType<typeof useAuth>);

    vi.mocked(listSubmissions).mockResolvedValue({
      clientId: "c1",
      clientName: "Acme",
      items: [],
    });
  });

  it("lets a linked user create a key and shows it once", async () => {
    vi.mocked(getAccount).mockResolvedValue({
      linked: true,
      email: "owner@example.com",
      clientName: "Acme",
      tier: "basic",
      active: true,
      hasBilling: false,
      hasApiKey: false,
    });
    vi.mocked(createApiKey).mockResolvedValue({
      apiKey: "fapi_created",
      hasApiKey: true,
      message: "Save this API key now — it will not be shown again.",
    });

    const user = userEvent.setup();
    render(<PortalApp tab="api-key" />);

    expect(
      await screen.findByRole("heading", { name: /no key issued/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /create key/i }));

    expect(createApiKey).toHaveBeenCalled();
    expect(await screen.findByText("fapi_created")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /key active/i })).toBeInTheDocument();
  });

  it("lets a linked user delete an active key after confirm", async () => {
    vi.mocked(getAccount).mockResolvedValue({
      linked: true,
      email: "owner@example.com",
      clientName: "Acme",
      tier: "basic",
      active: true,
      hasBilling: false,
      hasApiKey: true,
    });
    vi.mocked(deleteApiKey).mockResolvedValue({
      hasApiKey: false,
      message: "API key deleted",
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const user = userEvent.setup();
    render(<PortalApp tab="api-key" />);

    expect(
      await screen.findByRole("heading", { name: /key active/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /delete key/i }));

    expect(deleteApiKey).toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /no key issued/i }),
      ).toBeInTheDocument();
    });
  });
});
