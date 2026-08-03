import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Toaster, toast } from "./sonner";

describe("Toaster", () => {
  afterEach(() => {
    act(() => {
      toast.dismiss();
    });
  });

  it("renders colored success and error toasts", async () => {
    render(<Toaster />);

    act(() => {
      toast.success("Invite sent to teammate@company.com.");
    });

    const success = await screen.findByText(
      "Invite sent to teammate@company.com.",
    );
    expect(success.closest("[data-sonner-toast]")).toHaveAttribute(
      "data-type",
      "success",
    );
    expect(success.closest("[data-sonner-toast]")).toHaveAttribute(
      "data-rich-colors",
      "true",
    );

    act(() => {
      toast.dismiss();
      toast.error("Failed to send invite");
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to send invite")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Failed to send invite").closest("[data-sonner-toast]"),
    ).toHaveAttribute("data-type", "error");
  });
});
