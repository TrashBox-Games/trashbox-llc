import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { AccountSettings } from "./AccountSettings";

const updateAccountProfile = vi.fn();
const leaveOrganization = vi.fn();
const transferOrganizationOwnership = vi.fn();
const deleteUserAccount = vi.fn();
const getAccountProfile = vi.fn();
const listAccountOrganizations = vi.fn();

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    updateAccountProfile: (...args: unknown[]) => updateAccountProfile(...args),
    leaveOrganization: (...args: unknown[]) => leaveOrganization(...args),
    transferOrganizationOwnership: (...args: unknown[]) =>
      transferOrganizationOwnership(...args),
    deleteUserAccount: (...args: unknown[]) => deleteUserAccount(...args),
    getAccountProfile: (...args: unknown[]) => getAccountProfile(...args),
    listAccountOrganizations: (...args: unknown[]) =>
      listAccountOrganizations(...args),
  };
});

const initialState = {
  profile: {
    email: "owner@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
  },
  organizations: [
    {
      orgId: "o1",
      orgName: "Acme",
      orgSlug: "acme",
      role: "owner" as const,
      isOwner: true,
    },
    {
      orgId: "o2",
      orgName: "Beta",
      orgSlug: "beta",
      role: "member" as const,
      isOwner: false,
    },
  ],
};

describe("AccountSettings", () => {
  beforeEach(() => {
    updateAccountProfile.mockReset();
    leaveOrganization.mockReset();
    transferOrganizationOwnership.mockReset();
    deleteUserAccount.mockReset();
    updateAccountProfile.mockResolvedValue({
      success: true,
      profile: {
        email: "owner@example.com",
        firstName: "Augusta",
        lastName: "Lovelace",
      },
    });
  });

  it("saves the global profile", async () => {
    const user = userEvent.setup();
    render(
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "owner@example.com",
        }}
      >
        <StubPortalProvider value={{ ready: true, refreshWorkspace: vi.fn() }}>
          <AccountSettings initialState={initialState} />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(screen.getByLabelText(/^ada lovelace$/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/first name/i));
    await user.type(screen.getByLabelText(/first name/i), "Augusta");
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(updateAccountProfile).toHaveBeenCalledWith({
      firstName: "Augusta",
      lastName: "Lovelace",
    });
    expect(await screen.findByText(/profile updated/i)).toBeInTheDocument();
  });

  it("lets non-owners leave an organization", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    leaveOrganization.mockResolvedValue(undefined);
    getAccountProfile.mockResolvedValue({
      profile: initialState.profile,
    });
    listAccountOrganizations.mockResolvedValue({ organizations: [] });

    render(
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "owner@example.com",
        }}
      >
        <StubPortalProvider value={{ ready: true, refreshWorkspace: vi.fn() }}>
          <AccountSettings
            initialState={{
              ...initialState,
              organizations: [initialState.organizations[1]!],
            }}
          />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /^leave$/i }));
    expect(leaveOrganization).toHaveBeenCalledWith("o2");
  });
});
