"use client";

import { useCallback, useEffect, useState } from "react";
import { TeamPanel } from "@/components/features/portal/settings/TeamPanel";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { toast } from "@/components/ui/sonner";
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
import { normalizePlanTier, seatsForPlanTier } from "@/lib/form-plans";

export type TeamMembersSettingsInitialState = {
  members: TeamMember[];
  invites: TeamInvite[];
  roles: ClientRole[];
  role: TeamRole;
  canManageTeamMembers: boolean;
  memberLimit: number;
  memberCount: number;
  tier?: "free" | "solo" | "team";
  senderDisplayNames?: FromIdentity[];
};

interface TeamMembersSettingsProps {
  currentUserEmail?: string;
  /** Fallback when the team API omits tier (stories / older API). */
  tier?: "free" | "solo" | "team";
  /** When set, skip network load (Storybook/Chromatic demos). */
  initialState?: TeamMembersSettingsInitialState;
}

export function TeamMembersSettings({
  currentUserEmail,
  tier: tierProp,
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
  const [planTier, setPlanTier] = useState<"free" | "solo" | "team">(
    normalizePlanTier(initialState?.tier ?? tierProp ?? "free"),
  );
  const [memberLimit, setMemberLimit] = useState(
    initialState?.memberLimit ?? seatsForPlanTier(planTier),
  );
  const [memberCount, setMemberCount] = useState(
    initialState?.memberCount ?? 0,
  );
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(Boolean(initialState));
  const [error, setError] = useState<string | null>(null);

  const applyTeam = useCallback(
    (
      team: Awaited<ReturnType<typeof getTeam>>,
      mailbox: Awaited<ReturnType<typeof getMailbox>>,
    ) => {
      setMembers(team.members);
      setInvites(team.invites);
      setRoles(team.roles ?? []);
      setRole(team.role);
      setCanManageTeamMembers(
        team.role === "owner" ||
          hasPermission(team.permissions, "manage_team_members"),
      );
      const nextTier = normalizePlanTier(team.tier ?? tierProp ?? "free");
      setPlanTier(nextTier);
      // Prefer the higher of API limit and catalog seats for the resolved tier
      // so a stale project context cannot pin Team orgs at 1 seat.
      setMemberLimit(
        Math.max(team.memberLimit ?? 0, seatsForPlanTier(nextTier)),
      );
      setMemberCount(team.memberCount);
      setSenderDisplayNames(mailbox.fromIdentities ?? []);
    },
    [tierProp],
  );

  const loadTeam = useCallback(async () => {
    const [team, mailbox] = await Promise.all([getTeam(), getMailbox()]);
    applyTeam(team, mailbox);
  }, [applyTeam]);

  useEffect(() => {
    if (initialState) return;

    const stored = sessionStorage.getItem("portalTeamNotice");
    if (stored) {
      sessionStorage.removeItem("portalTeamNotice");
      toast.success(stored);
    }

    let cancelled = false;
    async function load() {
      setReady(false);
      setError(null);
      try {
        const [team, mailbox] = await Promise.all([getTeam(), getMailbox()]);
        if (cancelled) return;
        applyTeam(team, mailbox);
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
  }, [applyTeam, initialState]);

  async function onInvite(input: CreateTeamInviteInput) {
    setBusy(true);
    setError(null);
    try {
      await createTeamInvite(input);
      await loadTeam();
      toast.success(`Invite sent to ${input.email}.`);
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
      tier={planTier}
      busy={busy}
      error={error}
      onInvite={onInvite}
      onRevokeInvite={onRevokeInvite}
      onRemoveMember={onRemoveMember}
      onUpdateMember={onUpdateMember}
    />
  );
}
