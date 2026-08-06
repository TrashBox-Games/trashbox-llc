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
    expect(screen.getByRole("link", { name: /714-586-1630/i })).toHaveAttribute(
      "href",
      "tel:+17145861630",
    );
    expect(screen.getByRole("link", { name: /contact@trashbox\.io/i })).toHaveAttribute(
      "href",
      "mailto:contact@trashbox.io",
    );
  });
});
