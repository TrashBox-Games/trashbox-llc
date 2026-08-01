"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { usePortal } from "@/lib/portal";
import { getSelectedOrgId } from "@/lib/portal-selection";
import { PORTAL_PATHS } from "@/lib/sites";
import { cn } from "@/lib/utils";

function enterOrg(
  orgId: string,
  projectId: string | undefined,
  select: (o: string, p: string) => void,
) {
  if (projectId) {
    select(orgId, projectId);
  } else {
    select(orgId, "");
  }
  window.location.assign(PORTAL_PATHS.home);
}

export function OrgPicker() {
  const auth = useAuth();
  const portal = usePortal();
  const [showCreate, setShowCreate] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("create") === "1";
  });
  const selectedOrgId = getSelectedOrgId() || portal.account?.orgId || null;

  const pending =
    !auth.configured ||
    auth.status === "loading" ||
    auth.status === "signedOut" ||
    !portal.ready;

  const orgs =
    portal.orgs.length > 0
      ? portal.orgs
      : portal.account?.orgId
        ? [
            {
              orgId: portal.account.orgId,
              orgName:
                portal.account.orgName ||
                portal.account.clientName ||
                "Organization",
              role: portal.account.role || "member",
              tier: (portal.account.tier || "basic") as "basic" | "premium",
              active: portal.account.active !== false,
              hasBilling: Boolean(portal.account.hasBilling),
              projects: [
                {
                  projectId:
                    portal.account.projectId ||
                    portal.account.clientId ||
                    "",
                  projectName:
                    portal.account.projectName ||
                    portal.account.clientName ||
                    "Project",
                },
              ].filter((p) => p.projectId),
            },
          ]
        : [];

  useEffect(() => {
    if (auth.status === "signedOut") {
      window.location.replace(PORTAL_PATHS.login);
    }
  }, [auth.status]);

  useEffect(() => {
    if (!pending && orgs.length === 0) {
      setShowCreate(true);
    }
  }, [pending, orgs.length]);

  if (!auth.configured) {
    return (
      <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-6">
        Portal auth is not configured. Set `NEXT_PUBLIC_API_URL`,
        `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and `NEXT_PUBLIC_COGNITO_CLIENT_ID`
        then rebuild.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <FadeIn>
        <p className="font-label text-outline mb-6 text-xs tracking-[0.4em] uppercase">
          Organizations
        </p>
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-white md:text-5xl">
          Choose an organization
        </h1>
        <p className="text-on-surface-variant mt-4 text-lg">
          Signed in as {auth.email || portal.account?.email || "your account"}.
          Select where you want to work, or create a new organization.
        </p>
      </FadeIn>

      {pending ? (
        <PortalSkeleton variant="membership" />
      ) : (
        <FadeIn className="space-y-6" y={12}>
          {orgs.length > 0 && (
            <ul className="space-y-3">
              {orgs.map((org) => {
                const active = selectedOrgId === org.orgId;
                const firstProjectId = org.projects[0]?.projectId;
                return (
                  <li key={org.orgId}>
                    <button
                      type="button"
                      className={cn(
                        "border-outline-variant/15 hover:border-outline-variant/40 w-full border px-5 py-4 text-left transition-colors",
                        active
                          ? "bg-surface-container-high border-white/30"
                          : "bg-surface-container-low",
                      )}
                      onClick={() =>
                        enterOrg(
                          org.orgId,
                          firstProjectId,
                          portal.selectWorkspace,
                        )
                      }
                    >
                      <p className="font-headline text-lg font-bold text-white">
                        {org.orgName}
                      </p>
                      <p className="text-on-surface-variant mt-1 text-xs">
                        {org.role}
                        {org.projects.length > 0
                          ? ` · ${org.projects.length} project${org.projects.length === 1 ? "" : "s"}`
                          : " · no projects yet"}
                        {active ? " · current" : ""}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!showCreate ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowCreate(true)}
            >
              Create new organization
            </Button>
          ) : (
            <section className="border-outline-variant/15 bg-surface-container-low space-y-6 border p-6">
              <div>
                <p className="font-label text-outline text-[10px] tracking-widest uppercase">
                  New organization
                </p>
                <h2 className="font-headline mt-2 text-xl font-bold text-white">
                  Create an organization
                </h2>
              </div>
              <div>
                <Label htmlFor="org-picker-name">Organization name</Label>
                <Input
                  id="org-picker-name"
                  type="text"
                  required
                  value={portal.businessName}
                  onChange={(e) => portal.setBusinessName(e.target.value)}
                  placeholder="Acme Inspections"
                />
              </div>
              {portal.billingError && (
                <p className="text-sm text-red-300">{portal.billingError}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  disabled={
                    portal.billingBusy || !portal.businessName.trim()
                  }
                  onClick={async () => {
                    await portal.onCreateOrganization();
                    window.location.assign(PORTAL_PATHS.home);
                  }}
                >
                  {portal.billingBusy ? "Creating…" : "Create & continue"}
                </Button>
                {orgs.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </section>
          )}
        </FadeIn>
      )}
    </div>
  );
}
