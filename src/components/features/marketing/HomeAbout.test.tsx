import { render, screen } from "@testing-library/react";
import { HomeAbout } from "./HomeAbout";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

describe("HomeAbout", () => {
  it("renders the about section with approach cards", () => {
    render(<HomeAbout />);

    expect(screen.getByRole("heading", { name: /engineering/i })).toBeInTheDocument();
    expect(screen.getByText(/kinetic codebases/i)).toBeInTheDocument();
    expect(screen.getByText(/intelligent motion/i)).toBeInTheDocument();
    expect(screen.getByText(/editorial design/i)).toBeInTheDocument();
  });
});
