import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { OrgPicker } from "./OrgPicker";

const assign = vi.fn();
const selectWorkspace = vi.fn();

describe("OrgPicker", () => {
  beforeEach(() => {
    assign.mockReset();
    selectWorkspace.mockReset();
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal("location", {
      ...window.location,
      assign,
      replace: assign,
    });
  });

  it("lists organizations and enters the org workspace on select", async () => {
    const user = userEvent.setup();
    const pushState = vi.spyOn(window.history, "pushState");
    render(
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "owner@example.com",
        }}
      >
        <StubPortalProvider
          value={{
            ready: true,
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
                    projectName: "Site",
                    projectSlug: "site",
                  },
                ],
              },
            ],
            account: { linked: true, email: "owner@example.com" },
            selectWorkspace,
          }}
        >
          <OrgPicker />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /choose an organization/i }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /acme co.*project/i }),
    );
    expect(selectWorkspace).toHaveBeenCalledWith("o1", "");
    expect(pushState).toHaveBeenCalledWith(null, "", "/portal/acme-co/");
  });

  it("opens organization settings from the gear on a card", async () => {
    const user = userEvent.setup();
    const pushState = vi.spyOn(window.history, "pushState");
    render(
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "owner@example.com",
        }}
      >
        <StubPortalProvider
          value={{
            ready: true,
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
                    projectName: "Site",
                    projectSlug: "site",
                  },
                ],
              },
            ],
            account: { linked: true, email: "owner@example.com" },
            selectWorkspace,
          }}
        >
          <OrgPicker />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: /settings for acme co/i }),
    );
    expect(selectWorkspace).toHaveBeenCalledWith("o1", "");
    expect(pushState).toHaveBeenCalledWith(
      null,
      "",
      "/portal/acme-co/settings/general/",
    );
  });

  it("shows create form when the user has no organizations", () => {
    render(
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "owner@example.com",
        }}
      >
        <StubPortalProvider
          value={{
            ready: true,
            orgs: [],
            account: { linked: false, email: "owner@example.com" },
            businessName: "",
            setBusinessName: vi.fn(),
            projectNameDraft: "",
            setProjectNameDraft: vi.fn(),
          }}
        >
          <OrgPicker />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /create an organization/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/project/i)).not.toBeInTheDocument();
  });

  it("enters org workspace from account fallback when listOrgs is empty", async () => {
    const user = userEvent.setup();
    const pushState = vi.spyOn(window.history, "pushState");
    render(
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "invitee@example.com",
        }}
      >
        <StubPortalProvider
          value={{
            ready: true,
            orgs: [],
            account: {
              linked: true,
              email: "invitee@example.com",
              orgId: "o1",
              orgName: "Acme Co",
              orgSlug: "acme-co",
              clientId: "p1",
              clientName: "Site",
              role: "member",
              tier: "free",
              active: true,
            },
            selectWorkspace,
          }}
        >
          <OrgPicker />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: /acme co.*project/i }),
    );
    expect(selectWorkspace).toHaveBeenCalledWith("o1", "");
    expect(assign).not.toHaveBeenCalled();
    expect(pushState).toHaveBeenCalledWith(null, "", "/portal/acme-co/");
  });

  it("does not reload the org picker when account fallback has no slug", async () => {
    const user = userEvent.setup();
    render(
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "invitee@example.com",
        }}
      >
        <StubPortalProvider
          value={{
            ready: true,
            orgs: [],
            account: {
              linked: true,
              email: "invitee@example.com",
              orgId: "o1",
              orgName: "Acme Co",
              clientId: "p1",
              clientName: "Site",
              role: "member",
            },
            selectWorkspace,
          }}
        >
          <OrgPicker />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: /acme co.*project/i }),
    );
    expect(selectWorkspace).toHaveBeenCalledWith("o1", "");
    expect(assign).not.toHaveBeenCalled();
  });
});
