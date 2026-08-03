import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { setSelectedWorkspace } from "@/lib/portal-selection";
import { PortalHome } from "./PortalHome";

describe("PortalHome", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setSelectedWorkspace("o1", null);
  });

  it("lists projects that open into the project inbox", () => {
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
                orgSlug: "acme-co",
                role: "owner",
                tier: "free",
                active: true,
                hasBilling: false,
                projects: [
                  {
                    projectId: "p1",
                    projectName: "Marketing site",
                    projectSlug: "marketing-site",
                  },
                ],
              },
            ],
            account: {
              linked: true,
              email: "owner@example.com",
              orgId: "o1",
              orgName: "Acme Co",
              orgSlug: "acme-co",
              tier: "free",
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
    expect(
      screen.getByRole("link", { name: /open project marketing site/i }),
    ).toHaveAttribute("href", "/portal/acme-co/marketing-site/inbox/");
    expect(screen.queryByText("Selected")).not.toBeInTheDocument();
    expect(
      screen
        .getByRole("link", { name: /switch organization/i })
        .getAttribute("href"),
    ).toMatch(/\/portal\/orgs\/?$/);
    expect(
      screen.getByRole("button", { name: /^create project$/i }),
    ).toBeInTheDocument();
  });
});
