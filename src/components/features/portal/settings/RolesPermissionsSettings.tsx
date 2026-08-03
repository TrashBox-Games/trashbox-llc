"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PERMISSION_LABELS,
  PERMISSIONS,
  type ClientRole,
  type CreateTeamRoleInput,
  type Permission,
  type UpdateTeamRoleInput,
} from "@/lib/api";

export interface RolesPermissionsSettingsProps {
  roles: ClientRole[];
  isOwner?: boolean;
  canManage?: boolean;
  busy?: boolean;
  error?: string | null;
  onCreateRole: (input: CreateTeamRoleInput) => Promise<void>;
  onUpdateRole: (roleId: string, patch: UpdateTeamRoleInput) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
}

export function RolesPermissionsSettings({
  roles,
  isOwner = false,
  canManage = false,
  busy = false,
  error,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}: RolesPermissionsSettingsProps) {
  const [newName, setNewName] = useState("");

  async function onSubmitCreate(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name || !canManage) return;
    await onCreateRole({ name, permissions: [] });
    setNewName("");
  }

  function togglePermission(role: ClientRole, permission: Permission) {
    if (!canManage || busy) return;
    const has = role.permissions.includes(permission);
    const permissions = has
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission];
    void onUpdateRole(role.id, { permissions });
  }

  return (
    <div className="space-y-10">
      {error && <p className="text-sm text-red-300">{error}</p>}

      {isOwner && (
        <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Owner
          </p>
          <p className="mt-3 text-sm text-on-surface-variant">
            Owner has all permissions (not editable).
          </p>
        </section>
      )}

      <section className="space-y-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg text-white">{role.name}</p>
                <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
                  {role.system ? "System Role" : "Custom Role"}
                </p>
              </div>
              {canManage && !role.system && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  aria-label={`Delete ${role.name}`}
                  onClick={() => void onDeleteRole(role.id)}
                >
                  Delete
                </Button>
              )}
            </div>

            <ul className="mt-6 space-y-3">
              {PERMISSIONS.map((permission) => {
                const checkboxId = `perm-${role.id}-${permission}`;
                return (
                  <li key={permission}>
                    <div className="flex cursor-pointer items-center gap-3 text-sm text-white">
                      <Checkbox
                        id={checkboxId}
                        aria-label={PERMISSION_LABELS[permission]}
                        checked={role.permissions.includes(permission)}
                        disabled={!canManage || busy}
                        onCheckedChange={() =>
                          togglePermission(role, permission)
                        }
                      />
                      <Label
                        htmlFor={checkboxId}
                        className="mb-0 cursor-pointer text-sm font-body tracking-normal text-white normal-case"
                      >
                        {PERMISSION_LABELS[permission]}
                      </Label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {canManage && (
        <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
          <Label>Create Custom Role</Label>
          <form
            className="mt-4 flex max-w-md flex-wrap items-end gap-3"
            onSubmit={(e) => void onSubmitCreate(e)}
          >
            <div className="min-w-[12rem] flex-1">
              <Label htmlFor="new-role-name">New Role Name</Label>
              <Input
                id="new-role-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Support"
                disabled={busy}
                maxLength={80}
              />
            </div>
            <Button type="submit" disabled={busy || !newName.trim()}>
              Create Role
            </Button>
          </form>
        </section>
      )}

      {!canManage && (
        <p className="text-sm text-on-surface-variant">
          You need Manage Roles And Permissions to edit roles.
        </p>
      )}
    </div>
  );
}
