import { render, screen } from "@testing-library/react";
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
    orgSlug: "acme-co",
    role: "owner" as const,
    tier: "free" as const,
    active: true,
    hasBilling: false,
    projects: [
      {
        projectId: "p1",
        projectName: "Marketing site",
        projectSlug: "marketing-site",
      },
      { projectId: "p2", projectName: "App", projectSlug: "app" },
    ],
  },
  {
    orgId: "o2",
    orgName: "Beta LLC",
    orgSlug: "beta-llc",
    role: "member" as const,
    tier: "team" as const,
    active: true,
    hasBilling: true,
    projects: [{ projectId: "p3", projectName: "Docs", projectSlug: "docs" }],
  },
];

function renderBreadcrumb() {
  return render(
    <StubAuthProvider value={{ status: "signedIn", configured: true }}>
      <StubPortalProvider
        value={{
          ready: true,
          orgs,
          account: {
            linked: true,
            orgId: "o1",
            orgName: "Acme Co",
            orgSlug: "acme-co",
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
}

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
    renderBreadcrumb();

    expect(
      screen.getByRole("button", { name: /organization: acme co/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /project: marketing site/i }),
    ).toBeInTheDocument();
  });

  it("opens org settings from the organization dropdown", async () => {
    const user = userEvent.setup();
    const pushState = vi.spyOn(window.history, "pushState");
    renderBreadcrumb();

    await user.click(
      screen.getByRole("button", { name: /organization: acme co/i }),
    );
    await user.click(screen.getByRole("menuitem", { name: /^settings$/i }));
    expect(pushState).toHaveBeenCalledWith(
      null,
      "",
      "/portal/acme-co/settings/general/",
    );
  });

  it("sends All organizations to the org picker", async () => {
    const user = userEvent.setup();
    renderBreadcrumb();

    await user.click(
      screen.getByRole("button", { name: /organization: acme co/i }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: /all organizations/i }),
    );
    expect(assign).toHaveBeenCalledWith("/portal/orgs/");
  });

  it("switches project from the project dropdown", async () => {
    const user = userEvent.setup();
    renderBreadcrumb();

    await user.click(
      screen.getByRole("button", { name: /project: marketing site/i }),
    );
    await user.click(screen.getByRole("menuitem", { name: /^app$/i }));
    expect(selectWorkspace).toHaveBeenCalledWith("o1", "p2");
  });
});
