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
  it("opens a Services dropdown with CRM linking to the platform", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /^services$/i }));

    expect(await screen.findByRole("menuitem", { name: /^crm$/i })).toHaveAttribute(
      "href",
      "/platform",
    );
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
