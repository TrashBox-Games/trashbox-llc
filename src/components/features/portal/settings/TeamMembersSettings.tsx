"use client";

import { useCallback, useEffect, useState } from "react";
import { TeamPanel } from "@/components/features/portal/settings/TeamPanel";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import {
  ApiError,
  createTeamInvite,
  deleteTeamInvite,
  deleteTeamMember,
  getMailbox,
  getTeam,
  hasPermission,
  updateTeamMember,
  type ClientRole,
  type CreateTeamInviteInput,
  type FromIdentity,
  type TeamInvite,
  type TeamMember,
  type TeamRole,
  type UpdateTeamMemberInput,
} from "@/lib/api";

export type TeamMembersSettingsInitialState = {
  members: TeamMember[];
  invites: TeamInvite[];
  roles: ClientRole[];
  role: TeamRole;
  canManageTeamMembers: boolean;
  memberLimit: number;
  memberCount: number;
  senderDisplayNames?: FromIdentity[];
};

interface TeamMembersSettingsProps {
  currentUserEmail?: string;
  tier?: "basic" | "premium";
  /** When set, skip network load (Storybook/Chromatic demos). */
  initialState?: TeamMembersSettingsInitialState;
}

export function TeamMembersSettings({
  currentUserEmail,
  tier,
  initialState,
}: TeamMembersSettingsProps) {
  const [members, setMembers] = useState<TeamMember[]>(
    initialState?.members ?? [],
  );
  const [invites, setInvites] = useState<TeamInvite[]>(
    initialState?.invites ?? [],
  );
  const [roles, setRoles] = useState<ClientRole[]>(initialState?.roles ?? []);
  const [senderDisplayNames, setSenderDisplayNames] = useState<FromIdentity[]>(
    initialState?.senderDisplayNames ?? [],
  );
  const [role, setRole] = useState<TeamRole>(initialState?.role ?? "member");
  const [canManageTeamMembers, setCanManageTeamMembers] = useState(
    initialState?.canManageTeamMembers ?? false,
  );
  const [memberLimit, setMemberLimit] = useState(
    initialState?.memberLimit ?? 1,
  );
  const [memberCount, setMemberCount] = useState(
    initialState?.memberCount ?? 0,
  );
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(Boolean(initialState));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    const [team, mailbox] = await Promise.all([getTeam(), getMailbox()]);
    setMembers(team.members);
    setInvites(team.invites);
    setRoles(team.roles ?? []);
    setRole(team.role);
    setCanManageTeamMembers(
      team.role === "owner" ||
        hasPermission(team.permissions, "manage_team_members"),
    );
    setMemberLimit(team.memberLimit);
    setMemberCount(team.memberCount);
    setSenderDisplayNames(mailbox.fromIdentities ?? []);
  }, []);

  useEffect(() => {
    if (initialState) return;

    const stored = sessionStorage.getItem("portalTeamNotice");
    if (stored) {
      sessionStorage.removeItem("portalTeamNotice");
      setNotice(stored);
    }

    let cancelled = false;
    async function load() {
      setReady(false);
      setError(null);
      try {
        await loadTeam();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load team",
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
  }, [loadTeam, initialState]);

  async function onInvite(input: CreateTeamInviteInput) {
    setBusy(true);
    setError(null);
    try {
      await createTeamInvite(input);
      await loadTeam();
      setNotice(`Invite sent to ${input.email}.`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to send invite",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onRevokeInvite(email: string) {
    setBusy(true);
    setError(null);
    try {
      await deleteTeamInvite(email);
      await loadTeam();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to revoke invite",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onRemoveMember(email: string) {
    setBusy(true);
    setError(null);
    try {
      await deleteTeamMember(email);
      await loadTeam();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to remove member",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateMember(email: string, patch: UpdateTeamMemberInput) {
    setBusy(true);
    setError(null);
    try {
      await updateTeamMember(email, patch);
      await loadTeam();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update member",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <PortalSkeleton variant="settings" />;
  }

  if (error && members.length === 0) {
    return (
      <p className="border border-outline-variant/20 bg-surface-container-low p-6 text-on-surface-variant">
        {error}
      </p>
    );
  }

  return (
    <TeamPanel
      role={role}
      currentUserEmail={currentUserEmail}
      members={members}
      invites={invites}
      roles={roles}
      canManageTeamMembers={canManageTeamMembers}
      senderDisplayNames={senderDisplayNames}
      memberLimit={memberLimit}
      memberCount={memberCount}
      tier={tier}
      busy={busy}
      error={error}
      notice={notice}
      onInvite={onInvite}
      onRevokeInvite={onRevokeInvite}
      onRemoveMember={onRemoveMember}
      onUpdateMember={onUpdateMember}
    />
  );
}
