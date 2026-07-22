"use client";

import { type FormEvent, useState } from "react";
import type {
  CreateTeamInviteInput,
  FromIdentity,
  TeamInvite,
  TeamMember,
  TeamRole,
  UpdateTeamMemberInput,
} from "@/lib/api";
import { teamMemberDisplayName } from "@/lib/api";
import { settingsSectionPath } from "@/lib/portal-settings";

const inputClass =
  "w-full border-0 border-b border-outline-variant bg-transparent py-4 text-white placeholder:text-outline-variant/50 focus:border-primary focus:ring-0 focus:outline-none";
const labelClass =
  "mb-2 block font-label text-[10px] uppercase tracking-widest text-outline";

export interface TeamPanelProps {
  role: TeamRole;
  currentUserEmail?: string;
  members: TeamMember[];
  invites: TeamInvite[];
  senderDisplayNames?: FromIdentity[];
  memberLimit: number;
  memberCount: number;
  tier?: "basic" | "premium";
  busy?: boolean;
  error?: string | null;
  notice?: string | null;
  onInvite: (input: CreateTeamInviteInput) => Promise<void>;
  onRevokeInvite: (email: string) => Promise<void>;
  onRemoveMember: (email: string) => Promise<void>;
  onUpdateMember: (
    email: string,
    patch: UpdateTeamMemberInput,
  ) => Promise<void>;
}

function canManageTeam(role: TeamRole): boolean {
  return role === "owner" || role === "admin";
}

export function TeamPanel({
  role,
  currentUserEmail,
  members,
  invites,
  senderDisplayNames = [],
  memberLimit,
  memberCount,
  tier,
  busy = false,
  error,
  notice,
  onInvite,
  onRevokeInvite,
  onRemoveMember,
  onUpdateMember,
}: TeamPanelProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inviteAsAdmin, setInviteAsAdmin] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editAllowedIds, setEditAllowedIds] = useState<string[]>([]);
  const [editDefaultId, setEditDefaultId] = useState("");
  const isOwner = role === "owner";
  const canManage = canManageTeam(role);
  const atCap = memberCount >= memberLimit;
  const selfEmail = currentUserEmail?.toLowerCase();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = email.trim();
    if (!next || atCap) return;
    await onInvite({
      email: next,
      ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
      ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
      emailNotifications,
      ...(isOwner && inviteAsAdmin ? { role: "admin" as const } : {}),
    });
    setEmail("");
    setFirstName("");
    setLastName("");
    setEmailNotifications(true);
    setInviteAsAdmin(false);
  }

  function canRemove(member: TeamMember): boolean {
    if (!canManage) return false;
    if (member.role === "owner") return false;
    if (member.role === "admin" && !isOwner) return false;
    return true;
  }

  function canEditProfile(member: TeamMember): boolean {
    const isSelf = selfEmail === member.email.toLowerCase();
    if (isSelf) return true;
    if (!canManage) return false;
    if (member.role === "admin" && !isOwner) return false;
    return true;
  }

  function canAssignSenderNames(member: TeamMember): boolean {
    if (!canManage) return false;
    if (member.role === "admin" && !isOwner) return false;
    return true;
  }

  function canToggleNotifications(member: TeamMember): boolean {
    return canEditProfile(member);
  }

  function startEdit(member: TeamMember) {
    setEditingEmail(member.email);
    setEditFirst(member.firstName ?? "");
    setEditLast(member.lastName ?? "");
    const allowed = member.allowedFromIdentityIds ?? [];
    setEditAllowedIds(allowed);
    setEditDefaultId(member.defaultFromIdentityId ?? allowed[0] ?? "");
  }

  function toggleAllowed(id: string) {
    setEditAllowedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      if (!next.includes(editDefaultId)) {
        setEditDefaultId(next[0] ?? "");
      }
      return next;
    });
  }

  async function saveEdit(member: TeamMember) {
    const patch: UpdateTeamMemberInput = {
      firstName: editFirst.trim() || null,
      lastName: editLast.trim() || null,
    };
    if (canAssignSenderNames(member)) {
      patch.allowedFromIdentityIds = editAllowedIds;
      patch.defaultFromIdentityId =
        editDefaultId && editAllowedIds.includes(editDefaultId)
          ? editDefaultId
          : editAllowedIds[0] ?? null;
    }
    await onUpdateMember(member.email, patch);
    setEditingEmail(null);
  }

  function defaultLabel(member: TeamMember): string | null {
    const id = member.defaultFromIdentityId;
    if (!id) return null;
    return senderDisplayNames.find((item) => item.id === id)?.name ?? null;
  }

  return (
    <div className="space-y-10">
      {notice && (
        <p className="border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
          {notice}
        </p>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}

      <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Members
          </p>
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Seats {memberCount} / {memberLimit}
            {tier === "basic" ? " · Basic" : tier === "premium" ? " · Premium" : ""}
          </p>
        </div>
        <ul className="mt-6 space-y-6">
          {members.map((member) => {
            const isSelf = selfEmail === member.email.toLowerCase();
            const editing = editingEmail === member.email;
            const defaultName = defaultLabel(member);
            return (
              <li
                key={member.email}
                className="border-b border-outline-variant/10 pb-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-white">{teamMemberDisplayName(member)}</p>
                    {teamMemberDisplayName(member) !== member.email && (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {member.email}
                      </p>
                    )}
                    <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
                      {member.role}
                      {member.emailNotifications ? " · emails on" : " · emails off"}
                      {defaultName ? ` · default: ${defaultName}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {canToggleNotifications(member) && (
                      <label className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <input
                          type="checkbox"
                          checked={member.emailNotifications}
                          disabled={busy}
                          onChange={(e) =>
                            void onUpdateMember(member.email, {
                              emailNotifications: e.target.checked,
                            })
                          }
                        />
                        Email alerts
                      </label>
                    )}
                    {canEditProfile(member) && !editing && (
                      <button
                        type="button"
                        disabled={busy}
                        className="font-headline text-xs uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-40"
                        onClick={() => startEdit(member)}
                      >
                        Edit profile
                      </button>
                    )}
                    {isOwner && member.role === "member" && (
                      <button
                        type="button"
                        disabled={busy}
                        className="font-headline text-xs uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-40"
                        onClick={() =>
                          void onUpdateMember(member.email, { role: "admin" })
                        }
                      >
                        Make admin
                      </button>
                    )}
                    {isOwner && member.role === "admin" && (
                      <button
                        type="button"
                        disabled={busy}
                        className="font-headline text-xs uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-40"
                        onClick={() =>
                          void onUpdateMember(member.email, { role: "member" })
                        }
                      >
                        Remove admin
                      </button>
                    )}
                    {canRemove(member) && !isSelf && (
                      <button
                        type="button"
                        disabled={busy}
                        className="font-headline text-xs uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-40"
                        onClick={() => void onRemoveMember(member.email)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {editing && (
                  <form
                    className="mt-4 grid max-w-xl gap-4 md:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void saveEdit(member);
                    }}
                  >
                    <div>
                      <label className={labelClass} htmlFor={`first-${member.email}`}>
                        First Name
                      </label>
                      <input
                        id={`first-${member.email}`}
                        value={editFirst}
                        onChange={(e) => setEditFirst(e.target.value)}
                        className={inputClass}
                        disabled={busy}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`last-${member.email}`}>
                        Last Name
                      </label>
                      <input
                        id={`last-${member.email}`}
                        value={editLast}
                        onChange={(e) => setEditLast(e.target.value)}
                        className={inputClass}
                        disabled={busy}
                      />
                    </div>
                    {canAssignSenderNames(member) && (
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <p className={labelClass}>Allowed Sender Display Names</p>
                          {senderDisplayNames.length === 0 ? (
                            <p className="text-sm text-on-surface-variant">
                              Create names in{" "}
                              <a
                                href={settingsSectionPath("sending-preferences")}
                                className="text-white underline"
                              >
                                Sending Preferences
                              </a>{" "}
                              first.
                            </p>
                          ) : (
                            <ul className="mt-2 space-y-2">
                              {senderDisplayNames.map((identity) => (
                                <li key={identity.id}>
                                  <label className="flex cursor-pointer items-center gap-3 text-sm text-white">
                                    <input
                                      type="checkbox"
                                      checked={editAllowedIds.includes(identity.id)}
                                      disabled={busy}
                                      onChange={() => toggleAllowed(identity.id)}
                                    />
                                    {identity.name}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <label
                            className={labelClass}
                            htmlFor={`default-${member.email}`}
                          >
                            Default Sender Display Name
                          </label>
                          <select
                            id={`default-${member.email}`}
                            value={editDefaultId}
                            disabled={busy || editAllowedIds.length === 0}
                            onChange={(e) => setEditDefaultId(e.target.value)}
                            className="w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm text-white focus:border-primary focus:outline-none"
                          >
                            {editAllowedIds.length === 0 && (
                              <option value="">None Assigned</option>
                            )}
                            {editAllowedIds.map((id) => {
                              const name =
                                senderDisplayNames.find((item) => item.id === id)
                                  ?.name ?? id;
                              return (
                                <option key={id} value={id}>
                                  {name}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 md:col-span-2">
                      <button
                        type="submit"
                        disabled={busy}
                        className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setEditingEmail(null)}
                        className="font-headline text-xs uppercase tracking-widest text-outline hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {canManage && (
        <>
          <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              Invite Teammate
            </p>
            {atCap ? (
              <p className="mt-4 text-sm text-on-surface-variant">
                {tier === "basic"
                  ? "Basic includes only the owner. Upgrade to Premium for up to 5 team seats."
                  : `Team is at the ${memberLimit}-seat limit. Remove someone before inviting.`}
              </p>
            ) : (
              <form
                className="mt-6 max-w-md space-y-6"
                onSubmit={(e) => void onSubmit(e)}
              >
                <div>
                  <label className={labelClass} htmlFor="invite-email">
                    Email
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="teammate@company.com"
                    disabled={busy}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="invite-first">
                      First Name
                    </label>
                    <input
                      id="invite-first"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputClass}
                      placeholder="Ada"
                      disabled={busy}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="invite-last">
                      Last Name
                    </label>
                    <input
                      id="invite-last"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={inputClass}
                      placeholder="Lovelace"
                      disabled={busy}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    disabled={busy}
                  />
                  Receive form email notifications
                </label>
                {isOwner && (
                  <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <input
                      type="checkbox"
                      checked={inviteAsAdmin}
                      onChange={(e) => setInviteAsAdmin(e.target.checked)}
                      disabled={busy}
                    />
                    Invite as admin
                  </label>
                )}
                <button
                  type="submit"
                  disabled={busy || !email.trim()}
                  className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
                >
                  {busy ? "Sending…" : "Send Invite"}
                </button>
              </form>
            )}
          </section>

          <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              Pending Invites
            </p>
            {invites.length === 0 ? (
              <p className="mt-4 text-sm text-on-surface-variant">
                No pending invites.
              </p>
            ) : (
              <ul className="mt-6 space-y-4">
                {invites.map((invite) => (
                  <li
                    key={invite.email}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/10 pb-4"
                  >
                    <div>
                      <p className="text-white">{teamMemberDisplayName(invite)}</p>
                      {teamMemberDisplayName(invite) !== invite.email && (
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {invite.email}
                        </p>
                      )}
                      <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
                        {invite.role} · invited by {invite.invitedBy}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      className="font-headline text-xs uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-40"
                      onClick={() => void onRevokeInvite(invite.email)}
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
