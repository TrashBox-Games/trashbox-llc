"use client";

import { useState, type ReactNode } from "react";
import { Select } from "@/components/atoms/Select";
import { LeadEmailThread } from "@/components/molecules/LeadEmailThread";
import {
  LEAD_STATUSES,
  LEAD_STATUS_DOT_CLASS,
  LEAD_STATUS_LABELS,
  LEAD_TAGS,
  LEAD_TAG_LABELS,
  leadNotesOf,
  leadStatusOf,
  leadTagsOf,
  teamMemberDisplayName,
  type FromIdentityOption,
  type LeadMessage,
  type LeadStatus,
  type LeadTag,
  type Submission,
  type TeamMember,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const labelClass =
  "mb-2 block font-label text-[10px] uppercase tracking-widest text-outline";

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function subjectOf(submission: Submission): string {
  const firstLine = submission.message.split("\n")[0]?.trim();
  if (firstLine) return firstLine.slice(0, 90);
  return `New lead from ${submission.senderName}`;
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-14 shrink-0 font-label text-[10px] uppercase text-outline">
        {label}
      </span>
      <div className="min-w-0 text-sm text-on-surface">{value}</div>
    </div>
  );
}

interface LeadDetailProps {
  submission: Submission;
  members: TeamMember[];
  busy?: boolean;
  mailboxConnected?: boolean;
  /** Connected mailbox address; used as the reply-from and "To" recipient. */
  fromAddress?: string;
  /** From identities the current user may use when replying. */
  fromOptions?: FromIdentityOption[];
  messages?: LeadMessage[];
  messageError?: string | null;
  onUpdate: (patch: {
    status?: LeadStatus;
    tags?: LeadTag[];
    assignedTo?: string | null;
  }) => Promise<void>;
  onAddNote: (body: string) => Promise<void>;
  onSendMessage?: (
    body: string,
    bodyHtml?: string,
    from?: { fromIdentityId?: string },
  ) => Promise<void>;
}

export function LeadDetail({
  submission,
  members,
  busy = false,
  mailboxConnected = false,
  fromAddress,
  fromOptions,
  messages = [],
  messageError = null,
  onUpdate,
  onAddNote,
  onSendMessage,
}: LeadDetailProps) {
  const [noteDraft, setNoteDraft] = useState("");
  const status = leadStatusOf(submission);
  const tags = leadTagsOf(submission);
  const notes = leadNotesOf(submission);

  async function toggleTag(tag: LeadTag) {
    const next = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];
    await onUpdate({ tags: next });
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="space-y-8 md:col-span-8">
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              Lead
            </p>
            <h2 className="mt-2 font-headline text-3xl font-bold tracking-tighter text-white">
              {submission.senderName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-surface-container-highest px-2 py-0.5 font-label text-[10px] uppercase tracking-widest text-white">
                {LEAD_STATUS_LABELS[status]}
              </span>
              <span className="font-mono text-[10px] uppercase text-outline-variant">
                ID: #{submission.submissionId.slice(0, 8)}
              </span>
            </div>
          </div>

          <div className="space-y-3 border-t border-outline-variant/10 pt-4">
            <MetaRow
              label="From"
              value={
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex size-6 items-center justify-center rounded-full bg-surface-container-highest text-[10px] font-bold text-white"
                  >
                    {initialsOf(submission.senderName)}
                  </span>
                  <span className="text-white">{submission.senderEmail}</span>
                </span>
              }
            />
            {fromAddress && <MetaRow label="To" value={fromAddress} />}
            <MetaRow
              label="Subject"
              value={
                <span className="font-medium text-white">
                  {subjectOf(submission)}
                </span>
              }
            />
          </div>
        </div>

        <div className="space-y-6 md:col-span-4">
          <div>
            <p className="font-mono text-[10px] uppercase text-outline-variant">
              Received
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {formatWhen(submission.submittedAt)}
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="detail-status">
              Status
            </label>
            <Select
              id="detail-status"
              value={status}
              disabled={busy}
              onChange={(next) => void onUpdate({ status: next as LeadStatus })}
              options={LEAD_STATUSES.map((s) => ({
                value: s,
                label: LEAD_STATUS_LABELS[s],
                indicatorClassName: LEAD_STATUS_DOT_CLASS[s],
              }))}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="detail-assignee">
              Assigned to
            </label>
            <Select
              id="detail-assignee"
              value={submission.assignedTo ?? ""}
              disabled={busy}
              onChange={(next) =>
                void onUpdate({ assignedTo: next ? next : null })
              }
              options={[
                { value: "", label: "Unassigned" },
                ...members.map((member) => {
                  const label = teamMemberDisplayName(member);
                  return {
                    value: member.email,
                    label:
                      label === member.email
                        ? member.email
                        : `${label} (${member.email})`,
                  };
                }),
              ]}
            />
          </div>

          <div>
            <p className={labelClass}>Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {LEAD_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={busy}
                    onClick={() => void toggleTag(tag)}
                    className={cn(
                      "rounded border px-2 py-1 font-label text-[9px] uppercase tracking-wider transition-colors",
                      active
                        ? "border-white bg-white text-background"
                        : "border-outline-variant/40 text-outline hover:border-white hover:text-white",
                    )}
                  >
                    {LEAD_TAG_LABELS[tag]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 whitespace-pre-wrap text-lg leading-relaxed text-on-surface-variant">
        {submission.message}
      </p>

      {submission.metadata && Object.keys(submission.metadata).length > 0 && (
        <dl className="mt-10 space-y-2 border-t border-outline-variant/10 pt-6">
          {Object.entries(submission.metadata).map(([key, value]) => (
            <div key={key} className="flex gap-4 text-sm">
              <dt className="font-label uppercase tracking-widest text-outline">
                {key}
              </dt>
              <dd className="text-white">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {onSendMessage && (
        <LeadEmailThread
          formMessage={submission.message}
          formFrom={submission.senderEmail}
          formAt={submission.submittedAt}
          messages={messages}
          mailboxConnected={mailboxConnected}
          fromAddress={fromAddress}
          fromOptions={fromOptions}
          busy={busy}
          error={messageError}
          onSend={onSendMessage}
        />
      )}

      <div className="mt-10 border-t border-outline-variant/10 pt-6">
        <p className={labelClass}>Notes</p>
        <ul className="space-y-4">
          {notes.length === 0 && (
            <li className="text-sm text-on-surface-variant">No notes yet.</li>
          )}
          {notes.map((note) => (
            <li key={note.id} className="text-sm">
              <p className="text-white">{note.body}</p>
              <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
                {note.authorEmail} · {formatWhen(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const body = noteDraft.trim();
            if (!body) return;
            void onAddNote(body).then(() => setNoteDraft(""));
          }}
        >
          <label className={labelClass} htmlFor="lead-note">
            Add note
          </label>
          <textarea
            id="lead-note"
            rows={3}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            className="w-full border border-outline-variant/20 bg-transparent p-3 text-sm text-white placeholder:text-outline focus:border-primary focus:outline-none"
            placeholder="Add a note…"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !noteDraft.trim()}
            className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
          >
            Save note
          </button>
        </form>
      </div>
    </div>
  );
}
