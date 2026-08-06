import { render, screen } from "@testing-library/react";
import { ServicesPage } from "./ServicesPage";

vi.mock("@gsap/react", () => ({
  useGSAP: () => {},
}));

vi.mock("@/hooks/use-hash-scroll", () => ({
  useHashScroll: () => {},
}));

vi.mock("@/components/features/contact/ContactForm", () => ({
  ContactForm: () => <div>Contact form</div>,
}));

describe("ServicesPage", () => {
  it("lists service offerings with links and contact", () => {
    render(<ServicesPage />);

    expect(
      screen.getByRole("heading", { name: /build once/i }),
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
    expect(screen.getByText(/contact form/i)).toBeInTheDocument();
  });
});
