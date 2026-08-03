import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { OrgGeneralSettings } from "./OrgGeneralSettings";

const updateOrganization = vi.fn();
const deleteOrganization = vi.fn();

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    updateOrganization: (...args: unknown[]) => updateOrganization(...args),
    deleteOrganization: (...args: unknown[]) => deleteOrganization(...args),
  };
});

const org = {
  orgId: "o1",
  orgName: "Acme Co",
  orgSlug: "acme-co",
  role: "owner" as const,
  tier: "free" as const,
  active: true,
  hasBilling: false,
  projects: [],
};

describe("OrgGeneralSettings", () => {
  beforeEach(() => {
    updateOrganization.mockReset();
    deleteOrganization.mockReset();
    updateOrganization.mockResolvedValue({
      orgId: "o1",
      orgName: "Acme Renamed",
      orgSlug: "acme-co",
    });
  });

  it("lets the owner rename the organization", async () => {
    const user = userEvent.setup();
    const refreshWorkspace = vi.fn();
    render(
      <StubAuthProvider value={{ status: "signedIn", configured: true }}>
        <StubPortalProvider value={{ ready: true, refreshWorkspace }}>
          <OrgGeneralSettings org={org} />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    const name = screen.getByLabelText(/^name$/i);
    await user.clear(name);
    await user.type(name, "Acme Renamed");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(updateOrganization).toHaveBeenCalledWith({
      orgId: "o1",
      orgName: "Acme Renamed",
    });
    expect(refreshWorkspace).toHaveBeenCalled();
  });

  it("hides danger zone for non-owners", () => {
    render(
      <StubAuthProvider value={{ status: "signedIn", configured: true }}>
        <StubPortalProvider value={{ ready: true }}>
          <OrgGeneralSettings org={{ ...org, role: "member" }} />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(
      screen.queryByRole("button", { name: /delete organization/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toBeDisabled();
  });

  it("shows the delete confirm name in its true casing", () => {
    render(
      <StubAuthProvider value={{ status: "signedIn", configured: true }}>
        <StubPortalProvider value={{ ready: true }}>
          <OrgGeneralSettings org={org} />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(screen.getByText(org.orgName)).toHaveClass("normal-case");
  });

  it("enables delete only when the typed name matches exact casing", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <StubAuthProvider value={{ status: "signedIn", configured: true }}>
        <StubPortalProvider value={{ ready: true }}>
          <OrgGeneralSettings org={org} />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    const confirm = screen.getByLabelText(/type .+ to confirm/i);
    const deleteButton = screen.getByRole("button", {
      name: /delete organization/i,
    });

    await user.type(confirm, "ACME CO");
    expect(deleteButton).toBeDisabled();

    await user.clear(confirm);
    await user.type(confirm, "Acme Co");
    expect(deleteButton).toBeEnabled();
  });
});
