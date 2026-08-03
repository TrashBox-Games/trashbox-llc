"use client";

import { useCallback, useEffect, useState } from "react";
import { RolesPermissionsSettings } from "@/components/features/portal/settings/RolesPermissionsSettings";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { toast } from "@/components/ui/sonner";
import {
  ApiError,
  createTeamRole,
  deleteTeamRole,
  getTeam,
  updateTeamRole,
  type ClientRole,
  type CreateTeamRoleInput,
  type UpdateTeamRoleInput,
} from "@/lib/api";
import { usePortal } from "@/lib/portal";

export function RolesPermissionsSettingsSection() {
  const portal = usePortal();
  const [roles, setRoles] = useState<ClientRole[]>(portal.roles);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    const team = await getTeam();
    setRoles(team.roles ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setReady(false);
      setError(null);
      try {
        await loadRoles();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load roles",
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [loadRoles]);

  async function onCreateRole(input: CreateTeamRoleInput) {
    setBusy(true);
    setError(null);
    try {
      await createTeamRole(input);
      await loadRoles();
      toast.success(`Created role ${input.name}.`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to create role",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateRole(roleId: string, patch: UpdateTeamRoleInput) {
    setBusy(true);
    setError(null);
    try {
      await updateTeamRole(roleId, patch);
      await loadRoles();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update role",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteRole(roleId: string) {
    setBusy(true);
    setError(null);
    try {
      await deleteTeamRole(roleId);
      await loadRoles();
      toast.success("Role deleted.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete role",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <PortalSkeleton variant="settings" />;
  }

  if (error && roles.length === 0) {
    return (
      <p className="border border-outline-variant/20 bg-surface-container-low p-6 text-on-surface-variant">
        {error}
      </p>
    );
  }

  return (
    <RolesPermissionsSettings
      roles={roles}
      isOwner={portal.isOwner}
      canManage={portal.hasPermission("manage_roles_and_permissions")}
      busy={busy}
      error={error}
      onCreateRole={onCreateRole}
      onUpdateRole={onUpdateRole}
      onDeleteRole={onDeleteRole}
    />
  );
}
