"use client";

import {
  EmailContentSettingsSection,
  type EmailContentSectionInitialState,
} from "@/components/features/portal/settings/EmailContentSettingsSection";
import type { EmailContentKind } from "@/components/features/portal/settings/EmailContentSettings";
import { MailboxSettings } from "@/components/features/portal/settings/MailboxSettings";
import { SendingPreferencesSettings } from "@/components/features/portal/settings/SendingPreferencesSettings";
import { SettingsPlaceholder } from "@/components/features/portal/settings/SettingsPlaceholder";
import { ApiDocsSettings } from "@/components/features/portal/settings/ApiDocsSettings";
import {
  ApiKeysSettings,
  type ApiKeysSettingsInitialState,
} from "@/components/features/portal/settings/ApiKeysSettings";
import { GeneralSettings } from "@/components/features/portal/settings/GeneralSettings";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { RolesPermissionsSettingsSection } from "@/components/features/portal/settings/RolesPermissionsSettingsSection";
import {
  TeamMembersSettings,
  type TeamMembersSettingsInitialState,
} from "@/components/features/portal/settings/TeamMembersSettings";
import { useAuth } from "@/lib/auth";
import { usePortal } from "@/lib/portal";
import {
  getSettingsSection,
  type SettingsSectionId,
} from "@/lib/portal-settings";

const EMAIL_CONTENT_SECTIONS: Partial<
  Record<SettingsSectionId, EmailContentKind>
> = {
  templates: "template",
  signatures: "signature",
  snippets: "snippet",
};

interface SettingsSectionContentProps {
  sectionId: SettingsSectionId;
  /** Storybook/demo seed for nested API-backed sections. */
  apiKeysInitialState?: ApiKeysSettingsInitialState;
  teamMembersInitialState?: TeamMembersSettingsInitialState;
  emailContentInitialState?: EmailContentSectionInitialState;
}

export function SettingsSectionContent({
  sectionId,
  apiKeysInitialState,
  teamMembersInitialState,
  emailContentInitialState,
}: SettingsSectionContentProps) {
  const auth = useAuth();
  const portal = usePortal();
  const section = getSettingsSection(sectionId);

  if (!auth.configured) {
    return (
      <p className="border border-outline-variant/20 bg-surface-container-low p-6 text-on-surface-variant">
        Portal auth is not configured. Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_COGNITO_USER_POOL_ID`,
        and `NEXT_PUBLIC_COGNITO_CLIENT_ID` then rebuild.
      </p>
    );
  }

  const contentPending =
    auth.status === "loading" || auth.status === "signedOut" || !portal.ready;

  if (contentPending) {
    return <PortalSkeleton variant="settings" />;
  }

  if (!portal.account?.linked) {
    return (
      <p className="text-on-surface-variant">
        Create an organization from the portal home before managing settings.
        Team and billing are organization-scoped; API keys and mailbox are
        project-scoped.
      </p>
    );
  }

  if (sectionId === "general") {
    return (
      <GeneralSettings
        email={auth.email || portal.account.email || ""}
        clientName={portal.clientName || portal.account.clientName}
        tier={portal.account.tier}
        active={portal.account.active}
        emailsUsed={portal.account.emailsUsed}
        emailLimit={portal.account.emailLimit}
      />
    );
  }

  if (sectionId === "email-accounts") {
    return (
      <MailboxSettings
        canManage={portal.hasPermission("manage_sender_display_names")}
        mailbox={portal.mailbox}
        busy={portal.mailboxBusy}
        error={portal.mailboxError}
        notice={portal.mailboxNotice}
        onConnect={portal.onMailboxConnect}
        onDisconnect={portal.onMailboxDisconnect}
        onSync={portal.onMailboxSync}
      />
    );
  }

  if (sectionId === "sending-preferences") {
    return (
      <SendingPreferencesSettings
        canManage={portal.hasPermission("manage_sender_display_names")}
        mailbox={portal.mailbox}
        busy={portal.mailboxBusy}
        error={portal.mailboxError}
        notice={portal.mailboxNotice}
        onPatch={portal.onMailboxPatch}
      />
    );
  }

  const emailContentKind = EMAIL_CONTENT_SECTIONS[sectionId];
  if (emailContentKind) {
    return (
      <EmailContentSettingsSection
        kind={emailContentKind}
        businessName={portal.account.clientName}
      />
    );
  }

  if (sectionId === "members") {
    return (
      <TeamMembersSettings
        currentUserEmail={portal.account.email}
        tier={portal.account.tier}
        initialState={teamMembersInitialState}
      />
    );
  }

  if (sectionId === "roles-permissions") {
    return <RolesPermissionsSettingsSection />;
  }

  if (sectionId === "api-keys") {
    return <ApiKeysSettings initialState={apiKeysInitialState} />;
  }

  if (sectionId === "api-documentation") {
    return <ApiDocsSettings />;
  }

  return (
    <SettingsPlaceholder
      sectionId={sectionId}
      title={section?.label ?? "This"}
    />
  );
}
