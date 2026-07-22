"use client";

import type {
  MailboxProvider,
  MailboxStatusResponse,
} from "@/lib/api";
import { settingsSectionPath } from "@/lib/portal-settings";
import { PORTAL_PATHS } from "@/lib/sites";

const labelClass =
  "mb-2 block font-label text-[10px] uppercase tracking-widest text-outline";

export interface MailboxSettingsProps {
  canManage?: boolean;
  mailbox: MailboxStatusResponse | null;
  busy?: boolean;
  error?: string | null;
  notice?: string | null;
  onConnect: (provider: MailboxProvider) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onSync: () => Promise<void>;
}

export function MailboxSettings({
  canManage = false,
  mailbox,
  busy = false,
  error,
  notice,
  onConnect,
  onDisconnect,
  onSync,
}: MailboxSettingsProps) {
  const connected = Boolean(mailbox?.connected);

  return (
    <div className="space-y-8 border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
      <div>
        <p className={labelClass}>Business Mailbox</p>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          Connect Google Workspace or Microsoft 365 so your team can reply to
          leads from the portal. One shared mailbox per business. Configure From
          display names in{" "}
          <a
            href={settingsSectionPath("sending-preferences")}
            className="text-white underline"
          >
            Sending Preferences
          </a>
          .
        </p>
      </div>

      {notice && (
        <p className="border border-outline-variant/20 bg-background/40 p-4 text-sm text-white">
          {notice}
        </p>
      )}
      {error && (
        <p className="border border-error/40 bg-error/10 p-4 text-sm text-error">
          {error}
        </p>
      )}

      {connected ? (
        <div className="space-y-4">
          <div>
            <p className={labelClass}>Connected As</p>
            <p className="text-lg text-white">{mailbox?.email}</p>
            <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-outline">
              {mailbox?.provider === "gmail"
                ? "Google Workspace"
                : "Microsoft 365"}
              {mailbox?.connectedBy ? ` · by ${mailbox.connectedBy}` : ""}
              {mailbox?.status === "error" ? " · sync error" : ""}
            </p>
            {mailbox?.lastSyncAt && (
              <p className="mt-1 text-xs text-on-surface-variant">
                Last Sync: {new Date(mailbox.lastSyncAt).toLocaleString()}
              </p>
            )}
            {mailbox?.lastError && (
              <p className="mt-2 text-sm text-error">{mailbox.lastError}</p>
            )}
          </div>

          {canManage && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void onSync()}
                className="border border-outline-variant/40 px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-white hover:border-white disabled:opacity-40"
              >
                Sync Now
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void onDisconnect()}
                className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
              >
                Disconnect
              </button>
            </div>
          )}

          {!canManage && (
            <p className="text-sm text-on-surface-variant">
              You need Manage Email Sender Display Names to disconnect or sync
              the mailbox.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            No mailbox connected yet.
            {!canManage &&
              " Ask someone with Manage Email Sender Display Names to connect one in Settings."}
          </p>
          {canManage && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void onConnect("gmail")}
                className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-40"
              >
                Connect Google Workspace
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void onConnect("microsoft")}
                className="border border-outline-variant/40 px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-white hover:border-white disabled:opacity-40"
              >
                Connect Microsoft 365
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-outline">
        After connecting, open a lead in{" "}
        <a href={PORTAL_PATHS.inbox} className="text-white underline">
          Inbox
        </a>{" "}
        to reply.
      </p>
    </div>
  );
}
