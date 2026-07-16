import { describe, expect, it, vi, beforeEach } from "vitest";
import { submitContactForm } from "./contact-form";

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.trashbox.io");
    vi.stubEnv("NEXT_PUBLIC_FORM_API_KEY", "fapi_test_key");
  });

  it("returns success when the API accepts the submission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: "Sent" }),
      }),
    );

    const result = await submitContactForm({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
    });

    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.trashbox.io/submit",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns an error when env vars are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_FORM_API_KEY", "");

    const result = await submitContactForm({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not configured/i);
  });
});
