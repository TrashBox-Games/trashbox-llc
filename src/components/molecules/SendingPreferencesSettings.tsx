"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  MailboxStatusResponse,
  PatchMailboxInput,
} from "@/lib/api";
import { settingsSectionPath } from "@/lib/portal-settings";

export interface SendingPreferencesSettingsProps {
  canManage?: boolean;
  mailbox: MailboxStatusResponse | null;
  busy?: boolean;
  error?: string | null;
  notice?: string | null;
  onPatch: (input: PatchMailboxInput) => Promise<void>;
}

export function SendingPreferencesSettings({
  canManage = false,
  mailbox,
  busy = false,
  error,
  notice,
  onPatch,
}: SendingPreferencesSettingsProps) {
  const identities = mailbox?.fromIdentities ?? [];
  const [nameDraft, setNameDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  return (
    <div className="space-y-8 border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
      <div>
        <Label>Sender Display Names</Label>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          Create the Sender Display Names your team can use when replying to
          leads (for example Sales Team or Support). These are not separate
          email addresses — replies still send from your{" "}
          <a
            href={settingsSectionPath("email-accounts")}
            className="text-white underline"
          >
            Connected Mailbox
          </a>
          . Assign each member&apos;s default and allowed names in{" "}
          <a
            href={settingsSectionPath("members")}
            className="text-white underline"
          >
            Members
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

      {canManage ? (
        <div>
          <Label>Catalog</Label>
          <ul className="mt-4 space-y-2">
            {identities.length === 0 && (
              <li className="text-sm text-on-surface-variant">
                No Sender Display Names yet.
              </li>
            )}
            {identities.map((identity) => (
              <li
                key={identity.id}
                className="flex flex-wrap items-center gap-3"
              >
                {editingId === identity.id ? (
                  <>
                    <Input
                      aria-label={`Rename ${identity.name}`}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="max-w-xs py-2"
                      disabled={busy}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy || !editingName.trim()}
                      onClick={() =>
                        void onPatch({
                          action: "updateIdentity",
                          id: identity.id,
                          name: editingName.trim(),
                        }).then(() => {
                          setEditingId(null);
                          setEditingName("");
                        })
                      }
                      className="h-auto px-0 py-0 font-label text-[10px] text-white"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      disabled={busy}
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      className="h-auto px-0 py-0 font-label text-[10px]"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-white">{identity.name}</span>
                    <Button
                      type="button"
                      variant="link"
                      disabled={busy}
                      onClick={() => {
                        setEditingId(identity.id);
                        setEditingName(identity.name);
                      }}
                      className="h-auto px-0 py-0 font-label text-[10px]"
                    >
                      Rename
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() =>
                        void onPatch({
                          action: "removeIdentity",
                          id: identity.id,
                        })
                      }
                      className="h-auto px-0 py-0 font-label text-[10px] text-error hover:text-error"
                    >
                      Remove
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <form
            className="mt-4 flex max-w-md flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const name = nameDraft.trim();
              if (!name) return;
              void onPatch({ action: "addIdentity", name }).then(() =>
                setNameDraft(""),
              );
            }}
          >
            <div className="min-w-[12rem] flex-1">
              <Label htmlFor="new-sender-name">New Sender Display Name</Label>
              <Input
                id="new-sender-name"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="py-2"
                placeholder="Sales Team"
                disabled={busy}
                maxLength={100}
              />
            </div>
            <Button type="submit" disabled={busy || !nameDraft.trim()}>
              Add Name
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-2 text-sm text-on-surface-variant">
          {identities.length === 0 ? (
            <p>No Sender Display Names have been created yet.</p>
          ) : (
            <ul className="space-y-1">
              {identities.map((identity) => (
                <li key={identity.id} className="text-white">
                  {identity.name}
                </li>
              ))}
            </ul>
          )}
          <p className="pt-2">
            You need Manage Email Sender Display Names to manage the catalog.
            Your allowed names are set under Members.
          </p>
        </div>
      )}
    </div>
  );
}
