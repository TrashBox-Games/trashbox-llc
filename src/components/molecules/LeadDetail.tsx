"use client";

import { useState } from "react";
import { Select } from "@/components/atoms/Select";
import {
  LEAD_STATUSES,
  LEAD_STATUS_DOT_CLASS,
  LEAD_STATUS_LABELS,
  LEAD_TAGS,
  LEAD_TAG_LABELS,
  leadNotesOf,
  leadStatusOf,
  leadTagsOf,
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

interface LeadDetailProps {
  submission: Submission;
  members: TeamMember[];
  busy?: boolean;
  onUpdate: (patch: {
    status?: LeadStatus;
    tags?: LeadTag[];
    assignedTo?: string | null;
  }) => Promise<void>;
  onAddNote: (body: string) => Promise<void>;
}

export function LeadDetail({
  submission,
  members,
  busy = false,
  onUpdate,
  onAddNote,
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
      <p className="font-label text-[10px] uppercase tracking-widest text-outline">
        Lead
      </p>
      <h2 className="mt-3 font-headline text-3xl font-bold text-white">
        {submission.senderName}
      </h2>
      <p className="mt-2 text-sm text-outline">{submission.senderEmail}</p>
      <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-outline">
        {formatWhen(submission.submittedAt)}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
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
              ...members.map((member) => ({
                value: member.email,
                label: member.name?.trim()
                  ? `${member.name.trim()} (${member.email})`
                  : member.email,
              })),
            ]}
          />
        </div>
      </div>

      <div className="mt-6">
        <p className={labelClass}>Tags</p>
        <div className="flex flex-wrap gap-2">
          {LEAD_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                disabled={busy}
                onClick={() => void toggleTag(tag)}
                className={cn(
                  "border px-3 py-1 font-label text-[10px] uppercase tracking-widest transition-colors",
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
            className="w-full border border-outline-variant/20 bg-transparent p-3 text-sm text-white placeholder:text-outline-variant/50 focus:border-primary focus:outline-none"
            placeholder="Called customer July 15, requested estimate"
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
