import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GeneralSettings } from "./GeneralSettings";

describe("GeneralSettings", () => {
  it("shows signed-in email, client, and plan usage", () => {
    render(
      <GeneralSettings
        email="ezekielbleh@gmail.com"
        clientName="Trashbox LLC"
        tier="basic"
        active
        emailsUsed={25}
        emailLimit={1000}
      />,
    );

    expect(screen.getByText(/^signed in$/i)).toBeInTheDocument();
    expect(screen.getByText("ezekielbleh@gmail.com")).toBeInTheDocument();
    expect(screen.getByText(/Client: Trashbox LLC/i)).toBeInTheDocument();
    expect(screen.getByText(/Plan:/i)).toBeInTheDocument();
    expect(screen.getByText("basic")).toBeInTheDocument();
    expect(screen.getByText(/25/)).toBeInTheDocument();
    expect(screen.getByText(/1,000/)).toBeInTheDocument();
  });

  it("marks inactive plans", () => {
    render(
      <GeneralSettings
        email="user@example.com"
        clientName="Acme"
        tier="premium"
        active={false}
        emailsUsed={10}
        emailLimit={100}
      />,
    );

    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });

  it("omits plan row when tier is missing", () => {
    render(
      <GeneralSettings email="user@example.com" clientName="Acme" />,
    );

    expect(screen.queryByText(/Plan:/i)).not.toBeInTheDocument();
  });
});
