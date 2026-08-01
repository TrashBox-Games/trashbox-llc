import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { setSelectedWorkspace } from "@/lib/portal-selection";
import { WorkspaceBreadcrumb } from "./WorkspaceBreadcrumb";

const selectWorkspace = vi.fn();
const assign = vi.fn();

const orgs = [
  {
    orgId: "o1",
    orgName: "Acme Co",
    role: "owner" as const,
    tier: "basic" as const,
    active: true,
    hasBilling: false,
    projects: [
      { projectId: "p1", projectName: "Marketing site" },
      { projectId: "p2", projectName: "App" },
    ],
  },
  {
    orgId: "o2",
    orgName: "Beta LLC",
    role: "member" as const,
    tier: "premium" as const,
    active: true,
    hasBilling: true,
    projects: [{ projectId: "p3", projectName: "Docs" }],
  },
];

describe("WorkspaceBreadcrumb", () => {
  beforeEach(() => {
    selectWorkspace.mockReset();
    assign.mockReset();
    localStorage.clear();
    sessionStorage.clear();
    setSelectedWorkspace("o1", "p1");
    vi.stubGlobal("location", {
      ...window.location,
      assign,
    });
  });

  it("renders organization / project crumb labels", () => {
    render(
      <StubAuthProvider value={{ status: "signedIn", configured: true }}>
        <StubPortalProvider
          value={{
            ready: true,
            orgs,
            account: {
              linked: true,
              orgId: "o1",
              orgName: "Acme Co",
              projectId: "p1",
              projectName: "Marketing site",
              clientId: "p1",
              clientName: "Marketing site",
            },
            selectWorkspace,
          }}
        >
          <WorkspaceBreadcrumb />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(
      screen.getByRole("button", { name: /organization: acme co/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /project: marketing site/i }),
    ).toBeInTheDocument();
  });

  it("lists organizations with create new at the bottom", async () => {
    const user = userEvent.setup();
    render(
      <StubAuthProvider value={{ status: "signedIn", configured: true }}>
        <StubPortalProvider
          value={{
            ready: true,
            orgs,
            account: {
              linked: true,
              orgId: "o1",
              orgName: "Acme Co",
              projectId: "p1",
              projectName: "Marketing site",
            },
            selectWorkspace,
          }}
        >
          <WorkspaceBreadcrumb />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: /organization: acme co/i }),
    );
    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /acme co/i })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: /beta llc/i })).toBeInTheDocument();
    expect(
      within(menu).getByRole("menuitem", { name: /create organization/i }),
    ).toBeInTheDocument();
  });

  it("switches project from the project dropdown", async () => {
    const user = userEvent.setup();
    render(
      <StubAuthProvider value={{ status: "signedIn", configured: true }}>
        <StubPortalProvider
          value={{
            ready: true,
            orgs,
            account: {
              linked: true,
              orgId: "o1",
              orgName: "Acme Co",
              projectId: "p1",
              projectName: "Marketing site",
            },
            selectWorkspace,
          }}
        >
          <WorkspaceBreadcrumb />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: /project: marketing site/i }),
    );
    await user.click(screen.getByRole("menuitem", { name: /^app$/i }));
    expect(selectWorkspace).toHaveBeenCalledWith("o1", "p2");
  });
});
