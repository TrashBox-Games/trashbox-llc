"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { PortalLink } from "@/components/features/portal/PortalLink";
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
import { portalWorkspacePath } from "@/lib/portal-routes";
import { setSelectedWorkspace } from "@/lib/portal-selection";
import { PORTAL_PATHS } from "@/lib/sites";

interface OrgSettingsProps {
  org: OrgSummary;
}

/** Organization-level settings: rename + danger zone delete. */
export function OrgSettings({ org }: OrgSettingsProps) {
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
    <div className="space-y-10">
      <FadeIn>
        <p className="font-label text-outline mb-6 text-xs tracking-[0.4em] uppercase">
          Organization
        </p>
        <h1 className="font-headline max-w-4xl text-4xl leading-tight font-bold tracking-tighter text-white md:text-5xl">
          {org.orgName}{" "}
          <span className="text-outline">settings.</span>
        </h1>
        <p className="text-on-surface-variant mt-4 max-w-xl text-lg">
          Manage this organization.{" "}
          <PortalLink
            href={portalWorkspacePath({
              orgSlug: org.orgSlug,
              surface: "orgHome",
            })}
            className="text-white underline"
          >
            Back to projects
          </PortalLink>
        </p>
      </FadeIn>

      <FadeIn
        className="border-outline-variant/15 bg-surface-container-low/60 max-w-xl space-y-6 border p-6"
        y={12}
      >
        <div>
          <p className="font-label text-outline text-[10px] tracking-widest uppercase">
            General
          </p>
          <h2 className="font-headline mt-2 text-xl font-bold text-white">
            Organization name
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm">
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
      </FadeIn>

      {isOwner ? (
        <FadeIn
          className="border-red-500/30 bg-surface-container-low/60 max-w-xl space-y-6 border p-6"
          y={12}
        >
          <div>
            <p className="font-label text-[10px] tracking-widest text-red-300 uppercase">
              Danger zone
            </p>
            <h2 className="font-headline mt-2 text-xl font-bold text-white">
              Delete organization
            </h2>
            <p className="text-on-surface-variant mt-1 text-sm">
              Permanently deletes this organization, all projects, inboxes, API
              keys, and memberships. This cannot be undone.
            </p>
          </div>
          <div>
            <Label htmlFor="org-settings-confirm">
              Type <span className="text-white">{org.orgName}</span> to confirm
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
        </FadeIn>
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
