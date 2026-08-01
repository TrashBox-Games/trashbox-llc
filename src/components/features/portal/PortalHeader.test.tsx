import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortalHeader } from "./PortalHeader";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portal/inbox/",
}));

vi.mock("next/image", () => ({
  default: (props: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} />
  ),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/portal", () => ({
  usePortal: vi.fn(),
}));

import { useAuth } from "@/lib/auth";
import { usePortal } from "@/lib/portal";

function setScrollY(y: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: y,
  });
  window.dispatchEvent(new Event("scroll"));
}

describe("PortalHeader", () => {
  beforeEach(() => {
    setScrollY(0);
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
    vi.mocked(usePortal).mockReturnValue({
      clientName: "Acme Co",
      members: [
        {
          email: "owner@example.com",
          role: "owner",
          joinedAt: "2024-01-01",
          firstName: "Ada",
          lastName: "Lovelace",
          emailNotifications: true,
        },
      ],
    } as ReturnType<typeof usePortal>);
  });

  it("is visible at the top of the page", () => {
    render(<PortalHeader />);
    const header = screen.getByRole("banner");
    expect(header.className).not.toMatch(/-translate-y-full/);
  });

  it("hides when scrolling down and reappears when scrolling up", () => {
    render(<PortalHeader />);
    const header = screen.getByRole("banner");

    act(() => {
      setScrollY(80);
    });
    expect(header.className).toMatch(/-translate-y-full/);

    act(() => {
      setScrollY(40);
    });
    expect(header.className).not.toMatch(/-translate-y-full/);
  });

  it("stays visible while the mobile menu is open", async () => {
    const user = userEvent.setup();
    render(<PortalHeader />);
    const header = screen.getByRole("banner");

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    act(() => {
      setScrollY(120);
    });
    expect(header.className).not.toMatch(/-translate-y-full/);
  });

  it("renders nav items as icons with accessible labels", () => {
    render(<PortalHeader />);
    const nav = screen.getByRole("navigation", { name: /portal/i });

    expect(
      within(nav).getByRole("link", { name: /^home$/i }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /^inbox$/i }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /^settings$/i }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /^membership$/i }),
    ).toBeInTheDocument();

    expect(within(nav).queryByText("Home")).not.toBeInTheDocument();
    expect(within(nav).queryByText("Inbox")).not.toBeInTheDocument();
    expect(within(nav).queryByText("Settings")).not.toBeInTheDocument();
    expect(within(nav).queryByText("Membership")).not.toBeInTheDocument();
  });

  it("links the logo to the trashbox.io root", () => {
    render(<PortalHeader />);
    expect(
      screen.getByRole("link", { name: /trashbox.*home/i }),
    ).toHaveAttribute("href", "/");
  });

  it("uses a compact bar height", () => {
    render(<PortalHeader />);
    const bar = screen.getByRole("banner").querySelector(":scope > div > div");
    expect(bar?.className).toMatch(/\bpy-2\b/);
    expect(bar?.className).not.toMatch(/\bpy-5\b/);
    expect(bar?.className).not.toMatch(/\bmd:py-6\b/);
  });

  it("does not show a Platform link", () => {
    render(<PortalHeader />);
    expect(screen.queryByRole("link", { name: /^platform$/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/back to platform/i)).not.toBeInTheDocument();
  });

  it("shows an account menu instead of a bare Sign out button", async () => {
    const user = userEvent.setup();
    const signOutUser = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      configured: true,
      status: "signedIn",
      email: "owner@example.com",
      signInWithPassword: vi.fn(),
      signUpWithPassword: vi.fn(),
      confirmSignUpCode: vi.fn(),
      resendCode: vi.fn(),
      signOutUser,
    } as ReturnType<typeof useAuth>);

    render(<PortalHeader />);

    expect(
      screen.queryByRole("button", { name: /^sign out$/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByText("Acme Co")).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: /sign out/i }));
    expect(signOutUser).toHaveBeenCalledTimes(1);
  });
});
