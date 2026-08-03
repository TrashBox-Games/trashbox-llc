import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { UsageSettings } from "./UsageSettings";

const org = {
  orgId: "o1",
  orgName: "Acme Co",
  orgSlug: "acme-co",
  role: "owner" as const,
  tier: "free" as const,
  active: true,
  hasBilling: false,
  projects: [
    {
      projectId: "p1",
      projectName: "Marketing",
      projectSlug: "marketing",
    },
  ],
};

describe("UsageSettings", () => {
  it("shows a submission progress bar for the current plan", () => {
    render(
      <StubAuthProvider
        value={{ status: "signedIn", configured: true, email: "owner@example.com" }}
      >
        <StubPortalProvider
          value={{
            ready: true,
            account: {
              linked: true,
              email: "owner@example.com",
              tier: "free",
              hasBilling: false,
              role: "owner",
              submissionsUsed: 4,
              submissionLimit: 10,
            },
          }}
        >
          <UsageSettings org={org} />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(screen.getByRole("heading", { name: /^Free$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /monthly form submissions/i }),
    ).toHaveAttribute("aria-valuenow", "4");
    expect(
      screen.getByRole("link", { name: /view plans/i }),
    ).toBeInTheDocument();
  });
});
