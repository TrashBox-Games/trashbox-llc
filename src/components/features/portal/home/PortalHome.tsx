"use client";

import { useEffect, useRef, useState } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { PortalLink } from "@/components/features/portal/PortalLink";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { usePortal } from "@/lib/portal";
import { portalOrgGateRedirect } from "@/lib/portal-org-gate";
import { portalWorkspacePath } from "@/lib/portal-routes";
import { getSelectedOrgId } from "@/lib/portal-selection";
import { DEFAULT_SETTINGS_SECTION } from "@/lib/portal-settings";
import { PORTAL_PATHS } from "@/lib/sites";

/** Workspace home for the selected organization (projects). */
export function PortalHome() {
  const auth = useAuth();
  const portal = usePortal();
  const hasSelectedOrg = Boolean(getSelectedOrgId());
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [showCreate, setShowCreate] = useState(false);

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
    setShowCreate(true);
    params.delete("createProject");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", next);
  }, [portal.ready, hasSelectedOrg]);

  useEffect(() => {
    if (!showCreate) return;
    projectInputRef.current?.focus();
  }, [showCreate]);

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
  const projects = org?.projects || [];

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
          Choose a project to open its inbox and settings.{" "}
          <PortalLink href={PORTAL_PATHS.orgs} className="text-white underline">
            Switch organization
          </PortalLink>
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
            className="border-outline-variant/15 bg-surface-container-low/60 border p-5 md:p-8"
            y={12}
          >
            <div className="mb-6">
              <p className="font-label text-outline text-[10px] tracking-widest uppercase">
                Projects
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const inboxHref =
                  org?.orgSlug && project.projectSlug
                    ? portalWorkspacePath({
                        orgSlug: org.orgSlug,
                        projectSlug: project.projectSlug,
                        surface: "inbox",
                      })
                    : PORTAL_PATHS.inbox;
                const settingsHref =
                  org?.orgSlug && project.projectSlug
                    ? portalWorkspacePath({
                        orgSlug: org.orgSlug,
                        projectSlug: project.projectSlug,
                        surface: "settings",
                        settingsRest: DEFAULT_SETTINGS_SECTION,
                      })
                    : null;

                return (
                  <li key={project.projectId}>
                    <article className="group border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/45 hover:bg-surface-container-high/70 flex h-full flex-col border p-5 transition-colors">
                      <PortalLink
                        href={inboxHref}
                        aria-label={`Open project ${project.projectName}`}
                        className="flex min-h-28 flex-1 flex-col text-left"
                        onClick={() => {
                          if (selectedOrgId) {
                            portal.selectWorkspace(
                              selectedOrgId,
                              project.projectId,
                            );
                          }
                        }}
                      >
                        <span className="border-outline-variant/25 bg-background/40 text-outline group-hover:text-white inline-flex size-10 items-center justify-center border">
                          <MaterialIcon
                            name="folder"
                            className="text-[1.25rem]!"
                          />
                        </span>
                        <h2 className="font-headline mt-4 text-xl font-bold tracking-tight text-white">
                          {project.projectName}
                        </h2>
                        <p className="text-on-surface-variant mt-1 text-xs">
                          {project.projectSlug
                            ? `/${project.projectSlug}`
                            : "Project"}
                        </p>
                      </PortalLink>

                      {settingsHref ? (
                        <div className="border-outline-variant/15 mt-5 border-t pt-4">
                          <Button asChild size="sm" variant="outline">
                            <PortalLink
                              href={settingsHref}
                              onClick={() => {
                                if (selectedOrgId) {
                                  portal.selectWorkspace(
                                    selectedOrgId,
                                    project.projectId,
                                  );
                                }
                              }}
                            >
                              Settings
                            </PortalLink>
                          </Button>
                        </div>
                      ) : null}
                    </article>
                  </li>
                );
              })}

              {selectedOrgId ? (
                <li>
                  {showCreate ? (
                    <div className="border-outline-variant/25 bg-surface-container-low flex h-full min-h-44 flex-col border p-5">
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <p className="font-label text-outline text-[10px] tracking-widest uppercase">
                          New project
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-outline hover:text-white"
                          aria-label="Cancel create project"
                          onClick={() => {
                            setShowCreate(false);
                            portal.setProjectNameDraft("");
                          }}
                        >
                          <MaterialIcon name="close" className="text-base!" />
                        </Button>
                      </div>
                      <div className="space-y-3">
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
                            onKeyDown={(e) => {
                              if (e.key !== "Enter") return;
                              e.preventDefault();
                              if (
                                !portal.billingBusy &&
                                portal.projectNameDraft.trim()
                              ) {
                                void portal.onCreateProject(selectedOrgId);
                              }
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          disabled={
                            portal.billingBusy ||
                            !portal.projectNameDraft.trim()
                          }
                          onClick={() =>
                            void portal.onCreateProject(selectedOrgId)
                          }
                        >
                          {portal.billingBusy ? "Creating…" : "Create project"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label="Create project"
                      className="border-outline-variant/25 text-outline hover:border-outline-variant/50 hover:bg-surface-container-high/50 hover:text-white flex h-full min-h-44 w-full flex-col items-center justify-center gap-3 border border-dashed transition-colors"
                      onClick={() => setShowCreate(true)}
                    >
                      <span className="border-outline-variant/30 inline-flex size-12 items-center justify-center border">
                        <MaterialIcon name="add" className="text-[1.75rem]!" />
                      </span>
                      <span className="font-label text-[10px] tracking-widest uppercase">
                        New project
                      </span>
                    </button>
                  )}
                </li>
              ) : null}
            </ul>
          </FadeIn>

          <div className="flex flex-wrap gap-3">
            {org?.orgSlug && org.projects[0]?.projectSlug ? (
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
