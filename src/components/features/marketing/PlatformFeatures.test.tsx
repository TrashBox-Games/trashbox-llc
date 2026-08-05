import { render, screen } from "@testing-library/react";
import { PlatformFeatures } from "./PlatformFeatures";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

describe("PlatformFeatures", () => {
  it("lists CRM features for leads, messaging, templates, and teams", () => {
    render(<PlatformFeatures />);

    expect(
      screen.getByRole("heading", { name: /built for leads and retention/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /lead management/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /email templates/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/40%/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /messaging and replies/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /secure team management/i }),
    ).toBeInTheDocument();
  });
});
