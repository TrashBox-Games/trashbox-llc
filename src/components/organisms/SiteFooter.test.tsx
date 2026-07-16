import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./SiteFooter";

describe("SiteFooter", () => {
  it("renders copyright and Trashbox credit link", () => {
    render(<SiteFooter />);

    expect(screen.getByText(/trashbox llc/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trashbox" })).toHaveAttribute(
      "href",
      "https://trashbox.io/",
    );
  });
});
