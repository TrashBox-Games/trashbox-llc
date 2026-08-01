"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { PortalLink } from "@/components/features/portal/PortalLink";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { usePortal } from "@/lib/portal";
import { portalOrgGateRedirect } from "@/lib/portal-org-gate";
import {
  portalNavigate,
  portalWorkspacePath,
} from "@/lib/portal-routes";
import { getSelectedOrgId } from "@/lib/portal-selection";
import { DEFAULT_SETTINGS_SECTION } from "@/lib/portal-settings";
import { PORTAL_PATHS } from "@/lib/sites";

/** Workspace home for the selected organization (projects). */
export function PortalHome() {
  const auth = useAuth();
  const portal = usePortal();
  const hasSelectedOrg = Boolean(getSelectedOrgId());
  const projectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (auth.status === "signedOut") {
      window.location.replace(PORTAL_PATHS.login);
      return;
    }
    if (auth.status !== "signedIn" || !portal.ready) return;
    const gate = portalOrgGateRedirect(
      window.location.pathname,
      hasSelectedOrg,
    );
    if (gate) window.location.replace(gate);
  }, [auth.status, portal.ready, hasSelectedOrg]);

  useEffect(() => {
    if (!portal.ready || !hasSelectedOrg) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("createProject") !== "1") return;
    projectInputRef.current?.focus();
    params.delete("createProject");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", next);
  }, [portal.ready, hasSelectedOrg]);

  if (!auth.configured) {
    return (
      <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-6">
        Portal auth is not configured. Set `NEXT_PUBLIC_API_URL`,
        `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and `NEXT_PUBLIC_COGNITO_CLIENT_ID`
        then rebuild.
      </p>
    );
  }

  const pending =
    auth.status === "loading" ||
    auth.status === "signedOut" ||
    !portal.ready ||
    !hasSelectedOrg;

  const selectedOrgId = getSelectedOrgId() || portal.account?.orgId || "";
  const org = portal.orgs.find((entry) => entry.orgId === selectedOrgId) || null;

  return (
    <div className="space-y-10">
      <FadeIn>
        <p className="font-label text-outline mb-6 text-xs tracking-[0.4em] uppercase">
          Workspace
        </p>
        <h1 className="font-headline max-w-4xl text-4xl leading-tight font-bold tracking-tighter text-white md:text-6xl">
          {org?.orgName || "Your"}{" "}
          <span className="text-outline">projects.</span>
        </h1>
        <p className="text-on-surface-variant mt-6 max-w-xl text-lg">
          Projects hold each site&apos;s inbox and API key.{" "}
          <Link href={PORTAL_PATHS.orgs} className="text-white underline">
            Switch organization
          </Link>
        </p>
      </FadeIn>

      {pending ? (
        <PortalSkeleton variant="membership" />
      ) : (
        <div className="space-y-8">
          {portal.billingNotice && (
            <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-4 text-sm">
              {portal.billingNotice}
            </p>
          )}

          <FadeIn
            className="border-outline-variant/10 bg-surface-container-low border p-6 md:p-8"
            y={12}
          >
            <ul className="space-y-3">
              {(org?.projects || []).map((project) => {
                const active =
                  (portal.account?.projectId || portal.account?.clientId) ===
                  project.projectId;
                const projectHome =
                  org?.orgSlug && project.projectSlug
                    ? portalWorkspacePath({
                        orgSlug: org.orgSlug,
                        projectSlug: project.projectSlug,
                        surface: "projectHome",
                      })
                    : null;
                const inboxHref =
                  org?.orgSlug && project.projectSlug
                    ? portalWorkspacePath({
                        orgSlug: org.orgSlug,
                        projectSlug: project.projectSlug,
                        surface: "inbox",
                      })
                    : PORTAL_PATHS.inbox;
                return (
                  <li
                    key={project.projectId}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/10 pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-white">{project.projectName}</p>
                      <p className="text-on-surface-variant text-xs">
                        Project
                        {active ? " · selected" : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!active && selectedOrgId && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            portal.selectWorkspace(
                              selectedOrgId,
                              project.projectId,
                            );
                            if (projectHome) portalNavigate(projectHome);
                          }}
                        >
                          Select
                        </Button>
                      )}
                      <Button asChild size="sm">
                        <PortalLink
                          href={inboxHref}
                          onClick={() => {
                            if (selectedOrgId) {
                              portal.selectWorkspace(
                                selectedOrgId,
                                project.projectId,
                              );
                            }
                          }}
                        >
                          Open inbox
                        </PortalLink>
                      </Button>
                    </div>
                  </li>
                );
              })}
              {(org?.projects || []).length === 0 && (
                <li className="text-on-surface-variant text-sm">
                  No projects yet. Create one below.
                </li>
              )}
            </ul>

            {selectedOrgId && (
              <div className="mt-8 max-w-md space-y-4 border-t border-outline-variant/10 pt-6">
                <p className="font-label text-outline text-[10px] tracking-widest uppercase">
                  New project
                </p>
                <div>
                  <Label htmlFor="project-name">Project name</Label>
                  <Input
                    ref={projectInputRef}
                    id="project-name"
                    type="text"
                    value={portal.projectNameDraft}
                    onChange={(e) =>
                      portal.setProjectNameDraft(e.target.value)
                    }
                    placeholder="Client site"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    portal.billingBusy || !portal.projectNameDraft.trim()
                  }
                  onClick={() => void portal.onCreateProject(selectedOrgId)}
                >
                  {portal.billingBusy ? "Creating…" : "Create project"}
                </Button>
              </div>
            )}
          </FadeIn>

          <div className="flex flex-wrap gap-3">
            {org?.orgSlug && org.projects[0]?.projectSlug ? (
              <>
                <Button asChild variant="outline">
                  <PortalLink
                    href={portalWorkspacePath({
                      orgSlug: org.orgSlug,
                      projectSlug: org.projects[0].projectSlug,
                      surface: "settings",
                      settingsRest: DEFAULT_SETTINGS_SECTION,
                    })}
                  >
                    Settings
                  </PortalLink>
                </Button>
                <Button asChild variant="outline">
                  <PortalLink
                    href={portalWorkspacePath({
                      orgSlug: org.orgSlug,
                      projectSlug: org.projects[0].projectSlug,
                      surface: "membership",
                    })}
                  >
                    Membership
                  </PortalLink>
                </Button>
              </>
            ) : null}
          </div>
          {portal.billingError && (
            <p className="text-sm text-red-300">{portal.billingError}</p>
          )}
        </div>
      )}
    </div>
  );
}
