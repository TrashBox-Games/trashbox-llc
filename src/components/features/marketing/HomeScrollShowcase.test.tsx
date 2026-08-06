import { render, screen } from "@testing-library/react";
import { HomeScrollShowcase } from "./HomeScrollShowcase";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

describe("HomeScrollShowcase", () => {
  it("lists service offerings as scroll panels with links", () => {
    render(<HomeScrollShowcase />);

    expect(
      screen.getByRole("heading", { name: /what we build/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^websites$/i })).toHaveAttribute(
      "href",
      "/services/websites",
    );
    expect(
      screen.getByRole("link", { name: /^web applications$/i }),
    ).toHaveAttribute("href", "/services/web-applications");
    expect(screen.getByRole("link", { name: /^systems$/i })).toHaveAttribute(
      "href",
      "/services/systems",
    );
    expect(screen.getByRole("link", { name: /^mobile apps$/i })).toHaveAttribute(
      "href",
      "/services/mobile-apps",
    );
    expect(
      screen.getByRole("link", { name: /^ai integration$/i }),
    ).toHaveAttribute("href", "/services/ai-integration");
  });
});
