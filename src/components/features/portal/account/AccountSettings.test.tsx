import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import {
  AccountSettings,
  DELETE_ACCOUNT_CONFIRM_PHRASE,
  DELETE_ACCOUNT_OWNERSHIP_REQUIREMENT,
} from "./AccountSettings";

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

  it("links owned organizations to Members settings", () => {
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

    const members = screen.getByRole("link", { name: /^members$/i });
    expect(members).toHaveAttribute(
      "href",
      expect.stringMatching(/\/acme\/settings\/members\/?$/),
    );
  });

  it("lists owned organizations in the danger zone", () => {
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
              organizations: [
                {
                  orgId: "o1",
                  orgName: "TrashBox-Games",
                  orgSlug: "trashbox-games",
                  role: "owner",
                  isOwner: true,
                },
                {
                  orgId: "o2",
                  orgName: "Hixclipz",
                  orgSlug: "hixclipz",
                  role: "owner",
                  isOwner: true,
                },
                {
                  orgId: "o3",
                  orgName: "Built-Different-By-God-s-Design",
                  orgSlug: "built-different",
                  role: "owner",
                  isOwner: true,
                },
                {
                  orgId: "o4",
                  orgName: "Member Org",
                  orgSlug: "member-org",
                  role: "member",
                  isOwner: false,
                },
              ],
            }}
          />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    const ownedMessage = screen.getByText(
      (_, element) =>
        element?.tagName === "P" &&
        element.textContent ===
          "Your account is currently an owner in these organizations: TrashBox-Games, Hixclipz, and Built-Different-By-God-s-Design",
    );
    expect(ownedMessage).toBeInTheDocument();
    expect(
      within(ownedMessage).getByText("TrashBox-Games").tagName,
    ).toBe("STRONG");
    expect(within(ownedMessage).getByText("Hixclipz").tagName).toBe("STRONG");
    expect(
      within(ownedMessage).getByText("Built-Different-By-God-s-Design")
        .tagName,
    ).toBe("STRONG");
    expect(
      screen.getByText(DELETE_ACCOUNT_OWNERSHIP_REQUIREMENT),
    ).toBeInTheDocument();
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

  it("requires typing the confirm phrase before deleting the account", async () => {
    const user = userEvent.setup();
    deleteUserAccount.mockResolvedValue(undefined);

    render(
      <StubAuthProvider
        value={{
          status: "signedIn",
          configured: true,
          email: "owner@example.com",
          signOutUser: vi.fn(),
        }}
      >
        <StubPortalProvider value={{ ready: true, refreshWorkspace: vi.fn() }}>
          <AccountSettings
            initialState={{ ...initialState, organizations: [] }}
          />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /delete account/i }));
    const dialog = screen.getByRole("dialog", { name: /delete account/i });
    expect(dialog).toBeInTheDocument();

    const confirmDelete = within(dialog).getByRole("button", {
      name: /^delete account$/i,
    });
    expect(confirmDelete).toBeDisabled();

    await user.type(
      within(dialog).getByLabelText(
        new RegExp(DELETE_ACCOUNT_CONFIRM_PHRASE, "i"),
      ),
      DELETE_ACCOUNT_CONFIRM_PHRASE,
    );
    expect(confirmDelete).toBeEnabled();
    await user.click(confirmDelete);
    expect(deleteUserAccount).toHaveBeenCalledTimes(1);
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
