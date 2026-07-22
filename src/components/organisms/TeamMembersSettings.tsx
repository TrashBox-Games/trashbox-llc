"use client";

import { useCallback, useEffect, useState } from "react";
import { TeamPanel } from "@/components/molecules/TeamPanel";
import { PortalSkeleton } from "@/components/organisms/PortalSkeleton";
import {
  ApiError,
  createTeamInvite,
  deleteTeamInvite,
  deleteTeamMember,
  getMailbox,
  getTeam,
  updateTeamMember,
  type CreateTeamInviteInput,
  type FromIdentity,
  type TeamInvite,
  type TeamMember,
  type TeamRole,
  type UpdateTeamMemberInput,
} from "@/lib/api";

interface TeamMembersSettingsProps {
  currentUserEmail?: string;
  tier?: "basic" | "premium";
}

export function TeamMembersSettings({
  currentUserEmail,
  tier,
}: TeamMembersSettingsProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [senderDisplayNames, setSenderDisplayNames] = useState<FromIdentity[]>(
    [],
  );
  const [role, setRole] = useState<TeamRole>("member");
  const [memberLimit, setMemberLimit] = useState(1);
  const [memberCount, setMemberCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    const [team, mailbox] = await Promise.all([getTeam(), getMailbox()]);
    setMembers(team.members);
    setInvites(team.invites);
    setRole(team.role);
    setMemberLimit(team.memberLimit);
    setMemberCount(team.memberCount);
    setSenderDisplayNames(mailbox.fromIdentities ?? []);
  }, []);

  useEffect(() => {
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
  }, [loadTeam]);

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
