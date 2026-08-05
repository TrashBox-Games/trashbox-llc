import { render, screen } from "@testing-library/react";
import { AboutPage } from "./AboutPage";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

describe("AboutPage", () => {
  it("renders brand, mission, and founder story", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { name: /trashbox/i })).toBeInTheDocument();
    expect(screen.getByText(/businesses of every size/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ezekiel mohr/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /ezekiel mohr/i })).toBeInTheDocument();
    expect(screen.getAllByText(/kingwood/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/amazon leo/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start a project/i })).toHaveAttribute(
      "href",
      "/services#contact",
    );
  });
});
