import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { submitContactForm } from "@/lib/contact-form";
import { ContactForm } from "./ContactForm";

vi.mock("@/lib/contact-form", () => ({
  submitContactForm: vi.fn(),
}));

describe("ContactForm", () => {
  it("shows success message after a valid submission", async () => {
    vi.mocked(submitContactForm).mockResolvedValue({
      success: true,
      message: "Transmission received.",
    });

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByPlaceholderText("Your Name"), "Ada Lovelace");
    await user.type(screen.getByPlaceholderText("Email Address"), "ada@example.com");
    await user.type(
      screen.getByPlaceholderText("Tell us about the monolith you want to build..."),
      "Need a kinetic portfolio site.",
    );
    await user.click(screen.getByRole("button", { name: /send transmission/i }));

    expect(await screen.findByText(/transmission received/i)).toBeInTheDocument();
  });
});
