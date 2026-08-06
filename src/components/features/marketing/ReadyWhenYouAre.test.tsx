import { render, screen } from "@testing-library/react";
import { ReadyWhenYouAre } from "./ReadyWhenYouAre";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

describe("ReadyWhenYouAre", () => {
  it("renders the about-style CTA linking to services contact", () => {
    render(<ReadyWhenYouAre />);

    expect(
      screen.getByRole("heading", { name: /ready when you are/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /start a project/i }),
    ).toHaveAttribute("href", "/services#contact");
  });

  it("accepts a custom href", () => {
    render(<ReadyWhenYouAre href="/services/websites" />);

    expect(
      screen.getByRole("link", { name: /start a project/i }),
    ).toHaveAttribute("href", "/services/websites");
  });
});
