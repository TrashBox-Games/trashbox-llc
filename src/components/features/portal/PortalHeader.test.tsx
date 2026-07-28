import { act, render, screen } from "@testing-library/react";
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

import { useAuth } from "@/lib/auth";

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
});
