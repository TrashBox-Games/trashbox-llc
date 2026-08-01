"use client";

import { useEffect } from "react";
import { usePortal } from "@/lib/portal";
import {
  isLegacyPortalProductPath,
  portalNavigate,
  portalWorkspacePath,
  parsePortalWorkspacePath,
} from "@/lib/portal-routes";
import {
  getSelectedOrgId,
  getSelectedProjectId,
} from "@/lib/portal-selection";
import {
  DEFAULT_SETTINGS_SECTION,
  isSettingsSectionId,
} from "@/lib/portal-settings";
import { PORTAL_PATHS } from "@/lib/sites";

/**
 * Rewrites flat `/portal/inbox|settings|membership|` bookmarks into
 * `/portal/{orgSlug}/{projectSlug}/…` when a workspace is known.
 */
export function LegacyPortalRedirect() {
  const portal = usePortal();

  useEffect(() => {
    if (!portal.ready) return;
    const path = window.location.pathname;
    if (parsePortalWorkspacePath(path)) return;
    if (!isLegacyPortalProductPath(path)) return;

    const orgId = getSelectedOrgId() || portal.account?.orgId || null;
    const org = portal.orgs.find((entry) => entry.orgId === orgId);
    if (!org?.orgSlug) {
      window.location.replace(PORTAL_PATHS.orgs);
      return;
    }

    const normalized = path.replace(/\/$/, "") || "/";
    const settingsBase = PORTAL_PATHS.settings.replace(/\/$/, "");

    if (normalized === "/portal") {
      portalNavigate(
        portalWorkspacePath({ orgSlug: org.orgSlug, surface: "orgHome" }),
        { replace: true },
      );
      return;
    }

    const projectId =
      getSelectedProjectId() ||
      portal.account?.projectId ||
      portal.account?.clientId ||
      org.projects[0]?.projectId ||
      null;
    const project =
      org.projects.find((entry) => entry.projectId === projectId) ||
      org.projects[0];

    if (!project?.projectSlug) {
      portalNavigate(
        portalWorkspacePath({ orgSlug: org.orgSlug, surface: "orgHome" }),
        { replace: true },
      );
      return;
    }

    if (normalized === PORTAL_PATHS.inbox.replace(/\/$/, "")) {
      portalNavigate(
        portalWorkspacePath({
          orgSlug: org.orgSlug,
          projectSlug: project.projectSlug,
          surface: "inbox",
        }),
        { replace: true },
      );
      return;
    }

    if (normalized === PORTAL_PATHS.membership.replace(/\/$/, "")) {
      portalNavigate(
        portalWorkspacePath({
          orgSlug: org.orgSlug,
          projectSlug: project.projectSlug,
          surface: "membership",
        }),
        { replace: true },
      );
      return;
    }

    if (normalized === settingsBase || normalized.startsWith(`${settingsBase}/`)) {
      const after = normalized.slice(settingsBase.length).replace(/^\//, "");
      const settingsRest = after || DEFAULT_SETTINGS_SECTION;
      const section = settingsRest.split("/")[0];
      portalNavigate(
        portalWorkspacePath({
          orgSlug: org.orgSlug,
          projectSlug: project.projectSlug,
          surface: "settings",
          settingsRest: isSettingsSectionId(section)
            ? settingsRest
            : settingsRest || DEFAULT_SETTINGS_SECTION,
        }),
        { replace: true },
      );
    }
  }, [portal.ready, portal.orgs, portal.account]);

  return null;
}
