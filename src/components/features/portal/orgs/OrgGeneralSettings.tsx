"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ApiError,
  deleteOrganization,
  updateOrganization,
  type OrgSummary,
} from "@/lib/api";
import { usePortal } from "@/lib/portal";
import { setSelectedWorkspace } from "@/lib/portal-selection";
import { PORTAL_PATHS } from "@/lib/sites";

interface OrgGeneralSettingsProps {
  org: OrgSummary;
}

/** Organization general settings: rename + danger zone delete. */
export function OrgGeneralSettings({ org }: OrgGeneralSettingsProps) {
  const portal = usePortal();
  const isOwner = org.role === "owner";
  const [nameDraft, setNameDraft] = useState(org.orgName);
  const [confirmName, setConfirmName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setNameDraft(org.orgName);
  }, [org.orgId, org.orgName]);

  async function onSaveName() {
    const next = nameDraft.trim();
    if (!next) {
      setError("Enter an organization name");
      return;
    }
    if (next === org.orgName) {
      setNotice("No changes to save.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await updateOrganization({ orgId: org.orgId, orgName: next });
      setNotice("Organization name updated.");
      portal.refreshWorkspace();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update organization",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (confirmName.trim() !== org.orgName) {
      setError("Type the organization name exactly to confirm deletion.");
      return;
    }
    const ok = window.confirm(
      `Delete "${org.orgName}" and all of its projects? This cannot be undone.`,
    );
    if (!ok) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await deleteOrganization({
        orgId: org.orgId,
        confirmName: org.orgName,
      });
      setSelectedWorkspace(null, null);
      window.location.assign(PORTAL_PATHS.orgs);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not delete organization",
      );
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-outline-variant/10 bg-surface-container-low max-w-xl space-y-6 border p-6 md:p-8">
        <div>
          <p className="text-on-surface-variant text-sm">
            URL slug{" "}
            <span className="text-white">/{org.orgSlug}</span> stays the same
            when you rename.
          </p>
        </div>
        <div>
          <Label htmlFor="org-settings-name">Name</Label>
          <Input
            id="org-settings-name"
            type="text"
            value={nameDraft}
            disabled={!isOwner || busy}
            onChange={(e) => setNameDraft(e.target.value)}
          />
        </div>
        {isOwner ? (
          <Button
            type="button"
            disabled={busy || !nameDraft.trim()}
            onClick={() => void onSaveName()}
          >
            {busy ? "Saving…" : "Save changes"}
          </Button>
        ) : (
          <p className="text-on-surface-variant text-sm">
            Only the organization owner can rename or delete this organization.
          </p>
        )}
      </div>

      {isOwner ? (
        <div className="border-red-500/30 bg-surface-container-low max-w-xl space-y-6 border p-6 md:p-8">
          <div>
            <p className="font-label text-[10px] tracking-widest text-red-300 uppercase">
              Danger zone
            </p>
            <h3 className="font-headline mt-2 text-xl font-bold text-white">
              Delete organization
            </h3>
            <p className="text-on-surface-variant mt-1 text-sm">
              Permanently deletes this organization, all projects, inboxes, API
              keys, and memberships. This cannot be undone.
            </p>
          </div>
          <div>
            <Label htmlFor="org-settings-confirm">
              Type{" "}
              <span className="normal-case text-white">{org.orgName}</span> to
              confirm
            </Label>
            <Input
              id="org-settings-confirm"
              type="text"
              value={confirmName}
              disabled={busy}
              onChange={(e) => setConfirmName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={busy || confirmName.trim() !== org.orgName}
            onClick={() => void onDelete()}
          >
            <MaterialIcon name="delete" className="text-base!" />
            {busy ? "Deleting…" : "Delete organization"}
          </Button>
        </div>
      ) : null}

      {notice ? (
        <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant max-w-xl border p-4 text-sm">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="max-w-xl text-sm text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
