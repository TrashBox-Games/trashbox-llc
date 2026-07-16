"use client";

import { type FormEvent, useState } from "react";
import type { TeamInvite, TeamMember, TeamRole } from "@/lib/api";

const inputClass =
  "w-full border-0 border-b border-outline-variant bg-transparent py-4 text-white placeholder:text-outline-variant/50 focus:border-primary focus:ring-0 focus:outline-none";
const labelClass =
  "mb-2 block font-label text-[10px] uppercase tracking-widest text-outline";

interface TeamPanelProps {
  role: TeamRole;
  members: TeamMember[];
  invites: TeamInvite[];
  busy?: boolean;
  error?: string | null;
  notice?: string | null;
  onInvite: (email: string) => Promise<void>;
  onRevokeInvite: (email: string) => Promise<void>;
  onRemoveMember: (email: string) => Promise<void>;
}

export function TeamPanel({
  role,
  members,
  invites,
  busy = false,
  error,
  notice,
  onInvite,
  onRevokeInvite,
  onRemoveMember,
}: TeamPanelProps) {
  const [email, setEmail] = useState("");
  const isOwner = role === "owner";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = email.trim();
    if (!next) return;
    await onInvite(next);
    setEmail("");
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
        <p className="font-label text-[10px] uppercase tracking-widest text-outline">
          Members
        </p>
        <ul className="mt-6 space-y-4">
          {members.map((member) => (
            <li
              key={member.email}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/10 pb-4"
            >
              <div>
                <p className="text-white">{member.email}</p>
                <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
                  {member.role}
                </p>
              </div>
              {isOwner && member.role !== "owner" && (
                <button
                  type="button"
                  disabled={busy}
                  className="font-headline text-xs uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-40"
                  onClick={() => void onRemoveMember(member.email)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {isOwner && (
        <>
          <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              Invite teammate
            </p>
            <form className="mt-6 max-w-md space-y-6" onSubmit={(e) => void onSubmit(e)}>
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
              <button
                type="submit"
                disabled={busy || !email.trim()}
                className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
              >
                {busy ? "Sending…" : "Send invite"}
              </button>
            </form>
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
                      <p className="text-white">{invite.email}</p>
                      <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
                        Invited by {invite.invitedBy}
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

      {!isOwner && (
        <p className="text-sm text-on-surface-variant">
          Only the account owner can invite or remove teammates.
        </p>
      )}
    </div>
  );
}
