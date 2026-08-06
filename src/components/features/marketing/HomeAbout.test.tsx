import { render, screen } from "@testing-library/react";
import { HomeAbout } from "./HomeAbout";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

describe("HomeAbout", () => {
  it("renders marketing-focused about copy and offering cards", () => {
    render(<HomeAbout />);

    expect(
      screen.getByRole("heading", { name: /software that/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/earns its keep/i)).toBeInTheDocument();
    expect(screen.getByText(/sites that convert/i)).toBeInTheDocument();
    expect(screen.getByText(/products people use/i)).toBeInTheDocument();
    expect(screen.getByText(/systems that keep up/i)).toBeInTheDocument();
    expect(screen.getByText(/one-off builds/i)).toBeInTheDocument();
    expect(screen.getByText(/ongoing development/i)).toBeInTheDocument();
  });
});
