"use client";

import { useState } from "react";
import type { LeadMessage } from "@/lib/api";
import { settingsSectionPath } from "@/lib/portal-settings";

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

export interface LeadEmailThreadProps {
  formMessage: string;
  formFrom: string;
  formAt: string;
  messages: LeadMessage[];
  mailboxConnected: boolean;
  busy?: boolean;
  error?: string | null;
  onSend: (body: string) => Promise<void>;
}

export function LeadEmailThread({
  formMessage,
  formFrom,
  formAt,
  messages,
  mailboxConnected,
  busy = false,
  error,
  onSend,
}: LeadEmailThreadProps) {
  const [draft, setDraft] = useState("");

  return (
    <div className="mt-10 border-t border-outline-variant/10 pt-6">
      <p className={labelClass}>Email thread</p>

      <ul className="mt-4 space-y-4">
        <li className="border-l-2 border-outline-variant/40 pl-4">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Form submission · {formFrom}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-white">
            {formMessage}
          </p>
          <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
            {formatWhen(formAt)}
          </p>
        </li>

        {messages.map((message) => (
          <li
            key={message.messageId}
            className={[
              "border-l-2 pl-4",
              message.direction === "outbound"
                ? "border-primary"
                : "border-outline-variant/40",
            ].join(" ")}
          >
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              {message.direction === "outbound" ? "Sent" : "Received"} ·{" "}
              {message.from}
              {message.sentBy ? ` · ${message.sentBy}` : ""}
            </p>
            {message.subject && (
              <p className="mt-1 text-xs text-on-surface-variant">
                {message.subject}
              </p>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm text-white">
              {message.bodyText}
            </p>
            <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
              {formatWhen(message.createdAt)}
            </p>
          </li>
        ))}
      </ul>

      {error && (
        <p className="mt-4 text-sm text-error">{error}</p>
      )}

      {mailboxConnected ? (
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const body = draft.trim();
            if (!body) return;
            void onSend(body).then(() => setDraft(""));
          }}
        >
          <label className={labelClass} htmlFor="lead-reply">
            Reply
          </label>
          <textarea
            id="lead-reply"
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full border border-outline-variant/20 bg-transparent p-3 text-sm text-white placeholder:text-outline focus:border-primary focus:outline-none"
            placeholder="Write a reply…"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
          >
            Send reply
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-on-surface-variant">
          Connect a business mailbox in{" "}
          <a
            href={settingsSectionPath("email-accounts")}
            className="text-white underline"
          >
            Settings
          </a>{" "}
          to reply from the portal.
        </p>
      )}
    </div>
  );
}
