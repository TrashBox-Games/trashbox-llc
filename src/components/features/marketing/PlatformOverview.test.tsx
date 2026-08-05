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
    expect(screen.getByText(/40%/i)).toBeInTheDocument();
    expect(screen.getAllByText(/email templates/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/portal\/signup\/?/),
    );
    expect(screen.queryByRole("link", { name: /^features$/i })).not.toBeInTheDocument();
  });
});
