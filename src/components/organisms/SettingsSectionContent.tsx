"use client";

import { MailboxSettings } from "@/components/molecules/MailboxSettings";
import { SettingsPlaceholder } from "@/components/molecules/SettingsPlaceholder";
import { ApiDocsSettings } from "@/components/organisms/ApiDocsSettings";
import { ApiKeysSettings } from "@/components/organisms/ApiKeysSettings";
import { PortalSkeleton } from "@/components/organisms/PortalSkeleton";
import { TeamMembersSettings } from "@/components/organisms/TeamMembersSettings";
import { useAuth } from "@/lib/auth";
import { usePortal } from "@/lib/portal";
import {
  getSettingsSection,
  type SettingsSectionId,
} from "@/lib/portal-settings";

interface SettingsSectionContentProps {
  sectionId: SettingsSectionId;
}

export function SettingsSectionContent({
  sectionId,
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
        Create a Form API account from the inbox to manage settings.
      </p>
    );
  }

  if (sectionId === "email-accounts") {
    return (
      <MailboxSettings
        role={portal.teamRole}
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

  if (sectionId === "members") {
    return (
      <TeamMembersSettings
        currentUserEmail={portal.account.email}
        tier={portal.account.tier}
      />
    );
  }

  if (sectionId === "api-keys") {
    return <ApiKeysSettings />;
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
