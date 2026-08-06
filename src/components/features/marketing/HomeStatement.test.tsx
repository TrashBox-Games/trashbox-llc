import { render, screen } from "@testing-library/react";
import { HomeStatement } from "./HomeStatement";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

describe("HomeStatement", () => {
  it("renders the logo and scrub statement line", () => {
    render(<HomeStatement />);

    expect(screen.getByRole("img", { name: /trashbox llc/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /hire us for a single project/i }),
    ).toBeInTheDocument();
  });
});
