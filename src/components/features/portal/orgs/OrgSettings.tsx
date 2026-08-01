"use client";

import { OrgSettingsSectionContent } from "@/components/features/portal/orgs/OrgSettingsSectionContent";
import { SettingsShell } from "@/components/features/portal/settings/SettingsShell";
import type { OrgSummary } from "@/lib/api";
import { DEFAULT_SETTINGS_SECTION } from "@/lib/portal-settings";

interface OrgSettingsProps {
  org: OrgSummary;
}

/**
 * Full organization settings chrome (sidebar + general section).
 * Prefer PortalWorkspaceApp routing for section deep-links.
 */
export function OrgSettings({ org }: OrgSettingsProps) {
  return (
    <SettingsShell scope="org">
      <OrgSettingsSectionContent
        org={org}
        sectionId={DEFAULT_SETTINGS_SECTION}
      />
    </SettingsShell>
  );
}
