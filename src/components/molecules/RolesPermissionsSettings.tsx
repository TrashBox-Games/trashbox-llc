"use client";

import { type FormEvent, useState } from "react";
import {
  PERMISSION_LABELS,
  PERMISSIONS,
  type ClientRole,
  type CreateTeamRoleInput,
  type Permission,
  type UpdateTeamRoleInput,
} from "@/lib/api";

const labelClass =
  "mb-2 block font-label text-[10px] uppercase tracking-widest text-outline";
const inputClass =
  "w-full border-0 border-b border-outline-variant bg-transparent py-4 text-white placeholder:text-outline-variant/50 focus:border-primary focus:ring-0 focus:outline-none";

export interface RolesPermissionsSettingsProps {
  roles: ClientRole[];
  isOwner?: boolean;
  canManage?: boolean;
  busy?: boolean;
  error?: string | null;
  notice?: string | null;
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
  notice,
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
      {notice && (
        <p className="border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
          {notice}
        </p>
      )}
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
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Delete ${role.name}`}
                  className="font-headline text-xs uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-40"
                  onClick={() => void onDeleteRole(role.id)}
                >
                  Delete
                </button>
              )}
            </div>

            <ul className="mt-6 space-y-3">
              {PERMISSIONS.map((permission) => (
                <li key={permission}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-white">
                    <input
                      type="checkbox"
                      aria-label={PERMISSION_LABELS[permission]}
                      checked={role.permissions.includes(permission)}
                      disabled={!canManage || busy}
                      onChange={() => togglePermission(role, permission)}
                    />
                    {PERMISSION_LABELS[permission]}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {canManage && (
        <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
          <p className={labelClass}>Create Custom Role</p>
          <form
            className="mt-4 flex max-w-md flex-wrap items-end gap-3"
            onSubmit={(e) => void onSubmitCreate(e)}
          >
            <div className="min-w-[12rem] flex-1">
              <label className={labelClass} htmlFor="new-role-name">
                New Role Name
              </label>
              <input
                id="new-role-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClass}
                placeholder="Support"
                disabled={busy}
                maxLength={80}
              />
            </div>
            <button
              type="submit"
              disabled={busy || !newName.trim()}
              className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
            >
              Create Role
            </button>
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
