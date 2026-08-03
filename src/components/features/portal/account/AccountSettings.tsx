"use client";

import { useCallback, useEffect, useState } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import {
  PortalUserAvatar,
  portalUserDisplayName,
} from "@/components/features/portal/PortalUserMenu";
import { PortalLink } from "@/components/features/portal/PortalLink";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ApiError,
  deleteUserAccount,
  getAccountProfile,
  leaveOrganization,
  listAccountOrganizations,
  transferOrganizationOwnership,
  updateAccountProfile,
  type AccountDeleteBlocker,
  type AccountOrganization,
  type UserProfile,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usePortal } from "@/lib/portal";
import { orgSettingsSectionPath } from "@/lib/portal-settings";
import { PORTAL_PATHS } from "@/lib/sites";

export type AccountSettingsInitialState = {
  profile: UserProfile;
  organizations: AccountOrganization[];
};

/** Phrase the user must type to confirm account deletion. */
export const DELETE_ACCOUNT_CONFIRM_PHRASE = "delete-my-account";

interface AccountSettingsProps {
  initialState?: AccountSettingsInitialState;
}

/** Personal account settings: profile, organizations, danger zone. */
export function AccountSettings({ initialState }: AccountSettingsProps) {
  const auth = useAuth();
  const portal = usePortal();
  const [profile, setProfile] = useState<UserProfile | null>(
    initialState?.profile ?? null,
  );
  const [organizations, setOrganizations] = useState<AccountOrganization[]>(
    initialState?.organizations ?? [],
  );
  const [firstName, setFirstName] = useState(
    initialState?.profile.firstName ?? "",
  );
  const [lastName, setLastName] = useState(
    initialState?.profile.lastName ?? "",
  );
  const [transferEmail, setTransferEmail] = useState<Record<string, string>>(
    {},
  );
  const [ready, setReady] = useState(Boolean(initialState));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<AccountDeleteBlocker[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const load = useCallback(async () => {
    const [profileRes, orgsRes] = await Promise.all([
      getAccountProfile(),
      listAccountOrganizations(),
    ]);
    setProfile(profileRes.profile);
    setFirstName(profileRes.profile.firstName ?? "");
    setLastName(profileRes.profile.lastName ?? "");
    setOrganizations(orgsRes.organizations);
  }, []);

  useEffect(() => {
    if (initialState) return;
    if (auth.status === "signedOut") {
      window.location.replace(PORTAL_PATHS.login);
      return;
    }
    if (auth.status !== "signedIn") return;
    let cancelled = false;
    async function run() {
      setReady(false);
      setError(null);
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load account",
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [auth.status, initialState, load]);

  async function onSaveProfile() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await updateAccountProfile({
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
      });
      setProfile(result.profile);
      setNotice("Profile updated.");
      portal.refreshWorkspace();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update profile",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onLeave(orgId: string) {
    const org = organizations.find((entry) => entry.orgId === orgId);
    if (!org || org.isOwner) return;
    const ok = window.confirm(`Leave ${org.orgName}?`);
    if (!ok) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await leaveOrganization(orgId);
      setNotice(`Left ${org.orgName}.`);
      await load();
      portal.refreshWorkspace();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not leave organization",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onTransfer(orgId: string) {
    const email = (transferEmail[orgId] || "").trim();
    if (!email) {
      setError("Enter the member email to transfer ownership to.");
      return;
    }
    const org = organizations.find((entry) => entry.orgId === orgId);
    if (!org) return;
    const ok = window.confirm(
      `Transfer ownership of ${org.orgName} to ${email}?`,
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await transferOrganizationOwnership(orgId, email);
      setNotice(`Ownership of ${org.orgName} transferred.`);
      setTransferEmail((prev) => ({ ...prev, [orgId]: "" }));
      await load();
      portal.refreshWorkspace();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not transfer ownership",
      );
    } finally {
      setBusy(false);
    }
  }

  function openDeleteDialog() {
    setDeleteConfirm("");
    setError(null);
    setBlockers([]);
    setDeleteOpen(true);
  }

  function closeDeleteDialog() {
    if (busy) return;
    setDeleteOpen(false);
    setDeleteConfirm("");
  }

  async function onDeleteAccount() {
    if (deleteConfirm.trim() !== DELETE_ACCOUNT_CONFIRM_PHRASE) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    setBlockers([]);
    try {
      await deleteUserAccount();
      await auth.signOutUser();
      window.location.assign(PORTAL_PATHS.login);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const next = Array.isArray(err.data?.blockers)
          ? (err.data.blockers as AccountDeleteBlocker[])
          : [];
        setBlockers(next);
        setError(err.message);
        setDeleteOpen(false);
        setDeleteConfirm("");
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not delete account",
        );
      }
      setBusy(false);
    }
  }

  if (!auth.configured) {
    return (
      <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-6">
        Portal auth is not configured.
      </p>
    );
  }

  if (!ready) {
    return <PortalSkeleton variant="settings" />;
  }

  const email = profile?.email || auth.email || "";
  const composedName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const displayName = portalUserDisplayName(email, composedName || null);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <FadeIn>
        <p className="font-label text-outline mb-6 text-xs tracking-[0.4em] uppercase">
          Account
        </p>
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-white md:text-5xl">
          Settings
        </h1>
      </FadeIn>

      <FadeIn className="space-y-8" y={12}>
        <section className="border-outline-variant/15 bg-surface-container-low space-y-6 border p-6 md:p-8">
          <p className="font-label text-outline text-[10px] tracking-widest uppercase">
            Profile
          </p>
          <PortalUserAvatar label={displayName} size="lg" />
          <div>
            <Label htmlFor="account-email">Email</Label>
            <Input
              id="account-email"
              value={email}
              disabled
              readOnly
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="account-first">First name</Label>
              <Input
                id="account-first"
                value={firstName}
                disabled={busy}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="account-last">Last name</Label>
              <Input
                id="account-last"
                value={lastName}
                disabled={busy}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={busy}
              onClick={() => void onSaveProfile()}
            >
              {busy ? "Saving…" : "Save profile"}
            </Button>
            <Button asChild type="button" variant="outline">
              <PortalLink href={PORTAL_PATHS.forgotPassword}>
                Reset password
              </PortalLink>
            </Button>
          </div>
        </section>

        <section className="border-outline-variant/15 bg-surface-container-low space-y-6 border p-6 md:p-8">
          <p className="font-label text-outline text-[10px] tracking-widest uppercase">
            Organizations
          </p>
          {organizations.length === 0 ? (
            <p className="text-on-surface-variant text-sm">
              You are not in any organizations.
            </p>
          ) : (
            <ul className="space-y-4">
              {organizations.map((org) => (
                <li
                  key={org.orgId}
                  className="border-outline-variant/20 space-y-3 border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-headline text-lg font-bold text-white">
                        {org.orgName}
                      </p>
                      <p className="text-on-surface-variant mt-1 text-xs">
                        {org.isOwner ? "owner" : org.role}
                      </p>
                    </div>
                    {org.isOwner ? (
                      <Button asChild size="sm" variant="outline">
                        <PortalLink
                          href={orgSettingsSectionPath(org.orgSlug, "general")}
                        >
                          Org settings
                        </PortalLink>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void onLeave(org.orgId)}
                      >
                        Leave
                      </Button>
                    )}
                  </div>
                  {org.isOwner ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <div className="min-w-0 flex-1">
                        <Label htmlFor={`transfer-${org.orgId}`}>
                          Transfer to member email
                        </Label>
                        <Input
                          id={`transfer-${org.orgId}`}
                          type="email"
                          value={transferEmail[org.orgId] || ""}
                          disabled={busy}
                          onChange={(e) =>
                            setTransferEmail((prev) => ({
                              ...prev,
                              [org.orgId]: e.target.value,
                            }))
                          }
                          placeholder="member@example.com"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() => void onTransfer(org.orgId)}
                      >
                        Transfer ownership
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-outline-variant/15 border border-red-400/20 bg-surface-container-low space-y-4 p-6 md:p-8">
          <p className="font-label text-[10px] tracking-widest text-red-300 uppercase">
            Danger zone
          </p>
          {blockers.length > 0 ? (
            <ul className="text-on-surface-variant list-inside list-disc text-sm">
              {blockers.map((blocker) => (
                <li key={blocker.orgId}>
                  {blocker.reason === "owner"
                    ? `Transfer or delete ${blocker.orgName}`
                    : `Leave ${blocker.orgName}`}
                </li>
              ))}
            </ul>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="border-red-400/40 text-red-300 hover:bg-red-400/10 hover:text-red-200"
            disabled={busy}
            onClick={openDeleteDialog}
          >
            <MaterialIcon name="delete" className="text-base!" />
            Delete account
          </Button>
        </section>

        {notice ? (
          <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-4 text-sm">
            {notice}
          </p>
        ) : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </FadeIn>

      {deleteOpen ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={closeDeleteDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="border-outline-variant/25 bg-background w-full max-w-md space-y-5 border p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p
                id="delete-account-title"
                className="font-headline text-xl font-bold text-white"
              >
                Delete account
              </p>
              <p className="text-on-surface-variant mt-2 text-sm">
                This permanently removes your login. It cannot be undone.
              </p>
            </div>
            <div>
              <Label htmlFor="delete-account-confirm">
                Type{" "}
                <span className="text-white">
                  {DELETE_ACCOUNT_CONFIRM_PHRASE}
                </span>{" "}
                to confirm
              </Label>
              <Input
                id="delete-account-confirm"
                value={deleteConfirm}
                disabled={busy}
                autoComplete="off"
                autoFocus
                onChange={(e) => setDeleteConfirm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  if (
                    !busy &&
                    deleteConfirm.trim() === DELETE_ACCOUNT_CONFIRM_PHRASE
                  ) {
                    void onDeleteAccount();
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={closeDeleteDialog}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={
                  busy ||
                  deleteConfirm.trim() !== DELETE_ACCOUNT_CONFIRM_PHRASE
                }
                onClick={() => void onDeleteAccount()}
              >
                {busy ? "Deleting…" : "Delete account"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
