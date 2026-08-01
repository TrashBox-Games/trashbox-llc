"use client";

import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePortal } from "@/lib/portal";
import {
  getSelectedOrgId,
  getSelectedProjectId,
} from "@/lib/portal-selection";
import { PORTAL_PATHS } from "@/lib/sites";
import { cn } from "@/lib/utils";

function crumbTriggerClass(className?: string) {
  return cn(
    "h-auto max-w-[10rem] gap-1 truncate px-1.5 py-1 font-normal text-white hover:bg-white/5 hover:text-white md:max-w-[14rem]",
    className,
  );
}

/** GitHub-style Organization / Project breadcrumb with switcher dropdowns. */
export function WorkspaceBreadcrumb() {
  const portal = usePortal();
  const selectedOrgId =
    getSelectedOrgId() || portal.account?.orgId || null;
  const selectedProjectId =
    getSelectedProjectId() ||
    portal.account?.projectId ||
    portal.account?.clientId ||
    null;

  const orgs = portal.orgs ?? [];
  const selectedOrg =
    orgs.find((org) => org.orgId === selectedOrgId) ||
    (portal.account?.orgId
      ? {
          orgId: portal.account.orgId,
          orgName:
            portal.account.orgName ||
            portal.account.clientName ||
            "Organization",
          projects: portal.account.projectId || portal.account.clientId
            ? [
                {
                  projectId:
                    portal.account.projectId || portal.account.clientId || "",
                  projectName:
                    portal.account.projectName ||
                    portal.account.clientName ||
                    "Project",
                },
              ]
            : [],
        }
      : null);

  const selectedProject =
    selectedOrg?.projects.find((p) => p.projectId === selectedProjectId) ||
    null;

  const orgLabel = selectedOrg?.orgName || "Select organization";
  const projectLabel = selectedProject?.projectName || "Select project";

  return (
    <nav
      aria-label="Workspace"
      className="flex min-w-0 items-center gap-0.5 text-sm"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={crumbTriggerClass()}
            aria-label={`Organization: ${orgLabel}`}
          >
            <MaterialIcon
              name="corporate_fare"
              className="text-outline shrink-0 text-base!"
            />
            <span className="truncate">{orgLabel}</span>
            <MaterialIcon
              name="expand_more"
              className="text-outline shrink-0 text-base!"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          {orgs.map((org) => (
            <DropdownMenuItem
              key={org.orgId}
              onSelect={() => {
                const firstProjectId = org.projects[0]?.projectId;
                portal.selectWorkspace(org.orgId, firstProjectId || "");
                if (
                  typeof window !== "undefined" &&
                  window.location.pathname.includes("/portal/orgs")
                ) {
                  window.location.assign(PORTAL_PATHS.home);
                }
              }}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate">{org.orgName}</span>
                {org.orgId === selectedOrgId ? (
                  <MaterialIcon
                    name="check"
                    className="text-outline ml-auto shrink-0 text-base!"
                  />
                ) : null}
              </span>
            </DropdownMenuItem>
          ))}
          {orgs.length > 0 ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem
            onSelect={() => {
              window.location.assign(`${PORTAL_PATHS.orgs}?create=1`);
            }}
          >
            <MaterialIcon name="add" className="text-base!" />
            Create organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="text-outline px-0.5 select-none" aria-hidden>
        /
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={crumbTriggerClass()}
            aria-label={`Project: ${projectLabel}`}
            disabled={!selectedOrgId}
          >
            <MaterialIcon
              name="folder"
              className="text-outline shrink-0 text-base!"
            />
            <span className="truncate">{projectLabel}</span>
            <MaterialIcon
              name="expand_more"
              className="text-outline shrink-0 text-base!"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          {(selectedOrg?.projects || []).map((project) => (
            <DropdownMenuItem
              key={project.projectId}
              onSelect={() => {
                if (!selectedOrgId) return;
                portal.selectWorkspace(selectedOrgId, project.projectId);
              }}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate">{project.projectName}</span>
                {project.projectId === selectedProjectId ? (
                  <MaterialIcon
                    name="check"
                    className="text-outline ml-auto shrink-0 text-base!"
                  />
                ) : null}
              </span>
            </DropdownMenuItem>
          ))}
          {(selectedOrg?.projects.length || 0) > 0 ? (
            <DropdownMenuSeparator />
          ) : null}
          <DropdownMenuItem
            disabled={!selectedOrgId}
            onSelect={() => {
              window.location.assign(`${PORTAL_PATHS.home}?createProject=1`);
            }}
          >
            <MaterialIcon name="add" className="text-base!" />
            Create project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
