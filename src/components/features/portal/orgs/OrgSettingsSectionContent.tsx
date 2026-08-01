"use client";

import { BillingPlanSettings } from "@/components/features/portal/orgs/BillingPlanSettings";
import { OrgGeneralSettings } from "@/components/features/portal/orgs/OrgGeneralSettings";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { RolesPermissionsSettingsSection } from "@/components/features/portal/settings/RolesPermissionsSettingsSection";
import { SettingsPlaceholder } from "@/components/features/portal/settings/SettingsPlaceholder";
import {
  TeamMembersSettings,
  type TeamMembersSettingsInitialState,
} from "@/components/features/portal/settings/TeamMembersSettings";
import { useAuth } from "@/lib/auth";
import type { OrgSummary } from "@/lib/api";
import { usePortal } from "@/lib/portal";
import {
  getSettingsSection,
  type SettingsSectionId,
} from "@/lib/portal-settings";

interface OrgSettingsSectionContentProps {
  org: OrgSummary;
  sectionId: SettingsSectionId;
  teamMembersInitialState?: TeamMembersSettingsInitialState;
}

export function OrgSettingsSectionContent({
  org,
  sectionId,
  teamMembersInitialState,
}: OrgSettingsSectionContentProps) {
  const auth = useAuth();
  const portal = usePortal();
  const section = getSettingsSection(sectionId, "org");

  if (!auth.configured) {
    return (
      <p className="border-outline-variant/20 bg-surface-container-low text-on-surface-variant border p-6">
        Portal auth is not configured. Set `NEXT_PUBLIC_API_URL`,
        `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and `NEXT_PUBLIC_COGNITO_CLIENT_ID`
        then rebuild.
      </p>
    );
  }

  const contentPending =
    auth.status === "loading" || auth.status === "signedOut" || !portal.ready;

  if (contentPending) {
    return <PortalSkeleton variant="settings" />;
  }

  if (sectionId === "general") {
    return <OrgGeneralSettings org={org} />;
  }

  if (sectionId === "members") {
    if (org.projects.length === 0) {
      return (
        <p className="text-on-surface-variant">
          Create a project before inviting teammates. Team seats are billed on
          the organization plan.
        </p>
      );
    }
    return (
      <TeamMembersSettings
        currentUserEmail={auth.email || portal.account?.email}
        tier={portal.account?.tier ?? org.tier}
        initialState={teamMembersInitialState}
      />
    );
  }

  if (sectionId === "roles-permissions") {
    if (org.projects.length === 0) {
      return (
        <p className="text-on-surface-variant">
          Create a project before managing roles and permissions.
        </p>
      );
    }
    return <RolesPermissionsSettingsSection />;
  }

  if (sectionId === "current-plan" || sectionId === "upgrade-cancel") {
    return (
      <BillingPlanSettings
        org={org}
        showActions={sectionId === "current-plan" || sectionId === "upgrade-cancel"}
      />
    );
  }

  if (sectionId === "usage") {
    return (
      <BillingPlanSettings org={org} showActions={false} />
    );
  }

  return (
    <SettingsPlaceholder
      sectionId={sectionId}
      title={section?.label ?? "This"}
    />
  );
}
