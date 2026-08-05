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

  it("opens a Services dropdown with CRM linking to the platform", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /^services$/i }));

    expect(
      await screen.findByRole("menuitem", {
        name: /^customer relationship management$/i,
      }),
    ).toHaveAttribute("href", "/platform");
    expect(screen.getByRole("menuitem", { name: /^app design$/i })).toHaveAttribute(
      "href",
      "/services",
    );
    expect(screen.getByRole("menuitem", { name: /^development$/i })).toHaveAttribute(
      "href",
      "/services",
    );
    expect(screen.getByRole("menuitem", { name: /^ai integration$/i })).toHaveAttribute(
      "href",
      "/services",
    );
  });
});
