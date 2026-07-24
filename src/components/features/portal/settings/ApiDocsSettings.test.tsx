import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiDocsSettings } from "./ApiDocsSettings";

describe("ApiDocsSettings", () => {
  it("documents the submissions list endpoint", () => {
    render(<ApiDocsSettings />);
    expect(
      screen.getByRole("heading", { name: /list submissions/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("/submissions").length).toBeGreaterThan(0);
  });

  it("shows the HTTP methods for the submissions family", () => {
    render(<ApiDocsSettings />);
    expect(screen.getAllByText("GET").length).toBeGreaterThan(0);
    expect(screen.getAllByText("PATCH").length).toBeGreaterThan(0);
    expect(screen.getAllByText("POST").length).toBeGreaterThan(0);
  });

  it("explains bearer authentication", () => {
    render(<ApiDocsSettings />);
    expect(screen.getByText(/authentication/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bearer/i).length).toBeGreaterThan(0);
  });
});
