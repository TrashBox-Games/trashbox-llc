import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { setSelectedWorkspace } from "@/lib/portal-selection";
import { PortalHome } from "./PortalHome";

describe("PortalHome", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setSelectedWorkspace("o1", "p1");
  });

  it("lists projects for the selected organization", () => {
    render(
      <StubAuthProvider value={{ status: "signedIn", configured: true }}>
        <StubPortalProvider
          value={{
            ready: true,
            clientName: "Marketing site",
            orgs: [
              {
                orgId: "o1",
                orgName: "Acme Co",
                role: "owner",
                tier: "basic",
                active: true,
                hasBilling: false,
                projects: [
                  { projectId: "p1", projectName: "Marketing site" },
                ],
              },
            ],
            account: {
              linked: true,
              email: "owner@example.com",
              orgId: "o1",
              orgName: "Acme Co",
              projectId: "p1",
              projectName: "Marketing site",
              clientId: "p1",
              clientName: "Marketing site",
              tier: "basic",
              active: true,
              hasApiKey: true,
              hasBilling: false,
              role: "owner",
            },
          }}
        >
          <PortalHome />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /acme co/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Marketing site")).toBeInTheDocument();
    expect(
      screen
        .getByRole("link", { name: /switch organization/i })
        .getAttribute("href"),
    ).toMatch(/\/portal\/orgs\/?$/);
    expect(
      screen.getByRole("link", { name: /open inbox/i }).getAttribute("href"),
    ).toMatch(/\/portal\/inbox\/?$/);
  });
});
