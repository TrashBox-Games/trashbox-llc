"use client";

import { type FormEvent, useState } from "react";
import type {
  CreateTeamInviteInput,
  TeamInvite,
  TeamMember,
  TeamRole,
  UpdateTeamMemberInput,
} from "@/lib/api";

const inputClass =
  "w-full border-0 border-b border-outline-variant bg-transparent py-4 text-white placeholder:text-outline-variant/50 focus:border-primary focus:ring-0 focus:outline-none";
const labelClass =
  "mb-2 block font-label text-[10px] uppercase tracking-widest text-outline";

export interface TeamPanelProps {
  role: TeamRole;
  currentUserEmail?: string;
  members: TeamMember[];
  invites: TeamInvite[];
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

function displayName(member: { name?: string; email: string }): string {
  return member.name?.trim() || member.email;
}

export function TeamPanel({
  role,
  currentUserEmail,
  members,
  invites,
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
  const [name, setName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inviteAsAdmin, setInviteAsAdmin] = useState(false);
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
      ...(name.trim() ? { name: name.trim() } : {}),
      emailNotifications,
      ...(isOwner && inviteAsAdmin ? { role: "admin" as const } : {}),
    });
    setEmail("");
    setName("");
    setEmailNotifications(true);
    setInviteAsAdmin(false);
  }

  function canRemove(member: TeamMember): boolean {
    if (!canManage) return false;
    if (member.role === "owner") return false;
    if (member.role === "admin" && !isOwner) return false;
    return true;
  }

  function canToggleNotifications(member: TeamMember): boolean {
    const isSelf = selfEmail === member.email.toLowerCase();
    if (isSelf) return true;
    if (!canManage) return false;
    if (member.role === "admin" && !isOwner) return false;
    return true;
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
        <ul className="mt-6 space-y-4">
          {members.map((member) => {
            const isSelf = selfEmail === member.email.toLowerCase();
            return (
              <li
                key={member.email}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/10 pb-4"
              >
                <div>
                  <p className="text-white">{displayName(member)}</p>
                  {member.name?.trim() && (
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {member.email}
                    </p>
                  )}
                  <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
                    {member.role}
                    {member.emailNotifications ? " · emails on" : " · emails off"}
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
              </li>
            );
          })}
        </ul>
      </section>

      {canManage && (
        <>
          <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              Invite teammate
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
                <div>
                  <label className={labelClass} htmlFor="invite-name">
                    Name
                  </label>
                  <input
                    id="invite-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Ada Lovelace"
                    disabled={busy}
                  />
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
                  {busy ? "Sending…" : "Send invite"}
                </button>
              </form>
            )}
          </section>

          <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              Pending invites
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
                      <p className="text-white">{displayName(invite)}</p>
                      {invite.name?.trim() && (
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

      {!canManage && (
        <p className="text-sm text-on-surface-variant">
          Only owners and admins can invite or remove teammates. You can still
          toggle your own email alerts above.
        </p>
      )}
    </div>
  );
}
