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

  it("lists organizations and enters the first project on select", async () => {
    const user = userEvent.setup();
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
                role: "owner",
                tier: "basic",
                active: true,
                hasBilling: false,
                projects: [{ projectId: "p1", projectName: "Site" }],
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
    await user.click(screen.getByRole("button", { name: /acme co/i }));
    expect(selectWorkspace).toHaveBeenCalledWith("o1", "p1");
    expect(assign).toHaveBeenCalledWith("/portal/");
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
});
