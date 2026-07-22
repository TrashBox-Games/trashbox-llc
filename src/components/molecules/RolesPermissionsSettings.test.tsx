import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ClientRole } from "@/lib/api";
import { RolesPermissionsSettings } from "./RolesPermissionsSettings";

const adminRole: ClientRole = {
  id: "admin",
  name: "Admin",
  system: true,
  permissions: [
    "manage_sender_display_names",
    "allow_all_sender_display_names",
    "manage_team_members",
    "manage_roles_and_permissions",
    "manage_api_keys",
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const memberRole: ClientRole = {
  id: "member",
  name: "Member",
  system: true,
  permissions: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const customRole: ClientRole = {
  id: "support",
  name: "Support",
  system: false,
  permissions: ["manage_team_members"],
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

describe("RolesPermissionsSettings", () => {
  it("shows owner banner and lists roles with Title Case permission labels", () => {
    render(
      <RolesPermissionsSettings
        isOwner
        canManage
        roles={[adminRole, memberRole, customRole]}
        onCreateRole={vi.fn()}
        onUpdateRole={vi.fn()}
        onDeleteRole={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Owner has all permissions/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(
      screen.getAllByText("Manage Team Members").length,
    ).toBeGreaterThan(0);
  });

  it("lets managers toggle permissions on a role", async () => {
    const user = userEvent.setup();
    const onUpdateRole = vi.fn().mockResolvedValue(undefined);

    render(
      <RolesPermissionsSettings
        canManage
        roles={[memberRole]}
        onCreateRole={vi.fn()}
        onUpdateRole={onUpdateRole}
        onDeleteRole={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("checkbox", { name: /Manage API Keys/i }),
    );

    expect(onUpdateRole).toHaveBeenCalledWith("member", {
      permissions: ["manage_api_keys"],
    });
  });

  it("creates a custom role", async () => {
    const user = userEvent.setup();
    const onCreateRole = vi.fn().mockResolvedValue(undefined);

    render(
      <RolesPermissionsSettings
        canManage
        roles={[adminRole, memberRole]}
        onCreateRole={onCreateRole}
        onUpdateRole={vi.fn()}
        onDeleteRole={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/New Role Name/i), "Sales");
    await user.click(screen.getByRole("button", { name: /Create Role/i }));

    expect(onCreateRole).toHaveBeenCalledWith({
      name: "Sales",
      permissions: [],
    });
  });

  it("deletes custom roles only", async () => {
    const user = userEvent.setup();
    const onDeleteRole = vi.fn().mockResolvedValue(undefined);

    render(
      <RolesPermissionsSettings
        canManage
        roles={[adminRole, customRole]}
        onCreateRole={vi.fn()}
        onUpdateRole={vi.fn()}
        onDeleteRole={onDeleteRole}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Delete Admin/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Delete Support/i }));
    expect(onDeleteRole).toHaveBeenCalledWith("support");
  });

  it("hides editing controls without manage_roles_and_permissions", () => {
    render(
      <RolesPermissionsSettings
        canManage={false}
        roles={[adminRole, memberRole, customRole]}
        onCreateRole={vi.fn()}
        onUpdateRole={vi.fn()}
        onDeleteRole={vi.fn()}
      />,
    );

    expect(
      screen.queryByLabelText(/New Role Name/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Delete Support/i }),
    ).not.toBeInTheDocument();
    const checkboxes = screen.getAllByRole("checkbox", {
      name: /Manage API Keys/i,
    });
    expect(checkboxes.every((box) => (box as HTMLInputElement).disabled)).toBe(
      true,
    );
  });
});
