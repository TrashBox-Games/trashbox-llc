"use client";

import { useEffect, useMemo } from "react";
import { PortalHome } from "@/components/features/portal/home/PortalHome";
import { PortalApp } from "@/components/features/portal/leads/PortalPage";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { SettingsSectionContent } from "@/components/features/portal/settings/SettingsSectionContent";
import { SettingsShell } from "@/components/features/portal/settings/SettingsShell";
import { TemplateBuilderCreatePage } from "@/components/features/portal/settings/template-builder/TemplateBuilderCreatePage";
import { TemplateBuilderEditPage } from "@/components/features/portal/settings/template-builder/TemplateBuilderEditPage";
import { TemplateBuilderNewPage } from "@/components/features/portal/settings/template-builder/TemplateBuilderNewPage";
import { useAuth } from "@/lib/auth";
import { usePortal } from "@/lib/portal";
import {
  parsePortalWorkspacePath,
  portalNavigate,
  portalWorkspacePath,
} from "@/lib/portal-routes";
import {
  DEFAULT_SETTINGS_SECTION,
  isSettingsSectionId,
  type SettingsSectionId,
} from "@/lib/portal-settings";
import { PORTAL_PATHS } from "@/lib/sites";

function settingsSurface(settingsRest: string | undefined) {
  const rest = (settingsRest || "").replace(/^\/+|\/+$/g, "");
  if (rest === "templates/new") return "templates/new" as const;
  if (rest === "templates/builder") return "templates/builder" as const;
  if (rest === "templates/edit") return "templates/edit" as const;
  if (!rest) return DEFAULT_SETTINGS_SECTION;
  const section = rest.split("/")[0] || DEFAULT_SETTINGS_SECTION;
  return isSettingsSectionId(section) ? section : DEFAULT_SETTINGS_SECTION;
}

interface PortalWorkspaceAppProps {
  pathname?: string;
}

export function PortalWorkspaceApp({ pathname }: PortalWorkspaceAppProps) {
  const auth = useAuth();
  const portal = usePortal();
  const path =
    pathname ||
    (typeof window !== "undefined" ? window.location.pathname : "");
  const parsed = useMemo(() => parsePortalWorkspacePath(path), [path]);

  useEffect(() => {
    if (auth.status === "signedOut") {
      window.location.replace(PORTAL_PATHS.login);
    }
  }, [auth.status]);

  useEffect(() => {
    if (!portal.ready || !parsed || auth.status !== "signedIn") return;

    const org = portal.orgs.find((entry) => entry.orgSlug === parsed.orgSlug);
    if (!org) {
      window.location.replace(PORTAL_PATHS.orgs);
      return;
    }

    if (parsed.surface === "orgHome") {
      portal.selectWorkspace(org.orgId, "");
      return;
    }

    const project = org.projects.find(
      (entry) => entry.projectSlug === parsed.projectSlug,
    );
    if (!project) {
      portalNavigate(
        portalWorkspacePath({ orgSlug: org.orgSlug, surface: "orgHome" }),
        { replace: true },
      );
      return;
    }

    portal.selectWorkspace(org.orgId, project.projectId);
  }, [
    auth.status,
    parsed,
    portal.ready,
    portal.orgs,
    portal.selectWorkspace,
  ]);

  if (!auth.configured) {
    return (
      <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-6">
        Portal auth is not configured.
      </p>
    );
  }

  if (
    auth.status === "loading" ||
    auth.status === "signedOut" ||
    !portal.ready ||
    !parsed
  ) {
    return <PortalSkeleton />;
  }

  const org = portal.orgs.find((entry) => entry.orgSlug === parsed.orgSlug);
  if (!org) return <PortalSkeleton />;

  if (parsed.surface === "orgHome") {
    return <PortalHome />;
  }

  const project = org.projects.find(
    (entry) => entry.projectSlug === parsed.projectSlug,
  );
  if (!project) return <PortalSkeleton />;

  if (parsed.surface === "projectHome") {
    return <PortalHome />;
  }
  if (parsed.surface === "inbox") {
    return <PortalApp tab="inbox" />;
  }
  if (parsed.surface === "membership") {
    return <PortalApp tab="membership" />;
  }

  const settingsKind = settingsSurface(parsed.settingsRest);
  if (settingsKind === "templates/new") {
    return (
      <SettingsShell>
        <TemplateBuilderNewPage />
      </SettingsShell>
    );
  }
  if (settingsKind === "templates/builder") {
    return (
      <SettingsShell>
        <TemplateBuilderCreatePage />
      </SettingsShell>
    );
  }
  if (settingsKind === "templates/edit") {
    return (
      <SettingsShell>
        <TemplateBuilderEditPage />
      </SettingsShell>
    );
  }

  return (
    <SettingsShell>
      <SettingsSectionContent sectionId={settingsKind as SettingsSectionId} />
    </SettingsShell>
  );
}
