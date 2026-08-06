import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteHeader } from "./SiteHeader";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("SiteHeader", () => {
  it("hides before paint so the entrance animation does not flash then snap", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("navigation")).toHaveStyle({
      opacity: "0",
      transform: "translateY(-16px)",
    });
  });

  it("opens a Services dropdown with offering and CRM links", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /^services$/i }));

    expect(
      await screen.findByRole("menuitem", { name: /^websites$/i }),
    ).toHaveAttribute("href", "/services/websites");
    expect(
      screen.getByRole("menuitem", { name: /^web applications$/i }),
    ).toHaveAttribute("href", "/services/web-applications");
    expect(screen.getByRole("menuitem", { name: /^systems$/i })).toHaveAttribute(
      "href",
      "/services/systems",
    );
    expect(
      screen.getByRole("menuitem", { name: /^mobile apps$/i }),
    ).toHaveAttribute("href", "/services/mobile-apps");
    expect(
      screen.getByRole("menuitem", { name: /^ai integration$/i }),
    ).toHaveAttribute("href", "/services/ai-integration");
    expect(
      screen.getByRole("menuitem", {
        name: /^customer relationship management$/i,
      }),
    ).toHaveAttribute("href", expect.stringMatching(/\/platform\/?$/));
  });

  it("does not expose a top-level CRM link", () => {
    render(<SiteHeader />);

    expect(
      screen.queryByRole("link", { name: /^crm$/i }),
    ).not.toBeInTheDocument();
  });
});
