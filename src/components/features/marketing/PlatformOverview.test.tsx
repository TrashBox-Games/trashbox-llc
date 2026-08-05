import { render, screen } from "@testing-library/react";
import { PlatformOverview } from "./PlatformOverview";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

describe("PlatformOverview", () => {
  it("pitches the CRM around retention, leads, and key capabilities", () => {
    render(<PlatformOverview />);

    expect(screen.getByRole("heading", { name: /crm/i })).toBeInTheDocument();
    expect(screen.getByText(/customer retention/i)).toBeInTheDocument();
    expect(screen.getAllByText(/lead generation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/40%/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/email templates/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/portal\/signup\/?/),
    );
  });

  it("separates marketing story into capture, respond, and retain sections", () => {
    render(<PlatformOverview />);

    expect(
      screen.getByRole("heading", { name: /every lead in one place/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /reply faster/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /keep relationships warm/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /see features/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/platform\/features\/?/),
    );
    expect(screen.getByRole("link", { name: /view pricing/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/platform\/pricing\/?/),
    );
  });
});
