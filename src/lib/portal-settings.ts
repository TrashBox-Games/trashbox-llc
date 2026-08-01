import {
  parsePortalWorkspacePath,
  portalWorkspacePath,
} from "@/lib/portal-routes";
import { PORTAL_PATHS } from "@/lib/sites";

function currentWorkspaceSlugs(): {
  orgSlug: string;
  projectSlug: string;
} | null {
  if (typeof window === "undefined") return null;
  const parsed = parsePortalWorkspacePath(window.location.pathname);
  if (parsed?.orgSlug && parsed.projectSlug) {
    return { orgSlug: parsed.orgSlug, projectSlug: parsed.projectSlug };
  }
  return null;
}

export type SettingsGroupId =
  | "workspace"
  | "team"
  | "communication"
  | "crm"
  | "automation"
  | "developers"
  | "billing"
  | "security";

export type SettingsSectionId =
  | "general"
  | "branding"
  | "business-information"
  | "members"
  | "roles-permissions"
  | "activity-log"
  | "email-accounts"
  | "templates"
  | "signatures"
  | "snippets"
  | "sending-preferences"
  | "custom-fields"
  | "tags"
  | "pipelines"
  | "workflows"
  | "webhooks"
  | "api-keys"
  | "api-documentation"
  | "current-plan"
  | "usage"
  | "payment-methods"
  | "invoices"
  | "upgrade-cancel"
  | "password"
  | "two-factor"
  | "sessions"
  | "audit-log";

export interface SettingsNavItem {
  id: SettingsSectionId;
  label: string;
  icon: string;
}

export interface SettingsNavGroup {
  id: SettingsGroupId;
  label: string;
  icon: string;
  items: SettingsNavItem[];
}

/** Default landing section when visiting /portal/settings. */
export const DEFAULT_SETTINGS_SECTION: SettingsSectionId = "general";

export const PORTAL_SETTINGS_NAV: SettingsNavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    icon: "corporate_fare",
    items: [
      { id: "general", label: "General", icon: "settings" },
      { id: "branding", label: "Branding", icon: "palette" },
      {
        id: "business-information",
        label: "Business Information",
        icon: "storefront",
      },
    ],
  },
  {
    id: "team",
    label: "Team",
    icon: "group",
    items: [
      { id: "members", label: "Members", icon: "person" },
      {
        id: "roles-permissions",
        label: "Roles & Permissions",
        icon: "admin_panel_settings",
      },
      { id: "activity-log", label: "Activity Log", icon: "history" },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: "mail",
    items: [
      { id: "email-accounts", label: "Email Accounts", icon: "inbox" },
      { id: "templates", label: "Templates", icon: "description" },
      { id: "signatures", label: "Signatures", icon: "draw" },
      { id: "snippets", label: "Snippets", icon: "data_object" },
      {
        id: "sending-preferences",
        label: "Sending Preferences",
        icon: "tune",
      },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    icon: "handshake",
    items: [
      { id: "custom-fields", label: "Custom Fields", icon: "view_column" },
      { id: "tags", label: "Tags", icon: "sell" },
      { id: "pipelines", label: "Pipelines", icon: "view_kanban" },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    icon: "bolt",
    items: [
      { id: "workflows", label: "Workflows", icon: "account_tree" },
      { id: "webhooks", label: "Webhooks", icon: "webhook" },
    ],
  },
  {
    id: "developers",
    label: "Developers",
    icon: "code",
    items: [
      { id: "api-keys", label: "API Keys", icon: "key" },
      {
        id: "api-documentation",
        label: "API Documentation",
        icon: "menu_book",
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: "credit_card",
    items: [
      { id: "current-plan", label: "Current Plan", icon: "workspace_premium" },
      { id: "usage", label: "Usage", icon: "bar_chart" },
      { id: "payment-methods", label: "Payment Methods", icon: "payments" },
      { id: "invoices", label: "Invoices", icon: "receipt_long" },
      {
        id: "upgrade-cancel",
        label: "Upgrade / Cancel",
        icon: "trending_up",
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: "lock",
    items: [
      { id: "password", label: "Password", icon: "password" },
      {
        id: "two-factor",
        label: "Two-Factor Authentication",
        icon: "phonelink_lock",
      },
      { id: "sessions", label: "Sessions", icon: "devices" },
      { id: "audit-log", label: "Audit Log", icon: "policy" },
    ],
  },
];

const SECTION_BY_ID = new Map(
  PORTAL_SETTINGS_NAV.flatMap((group) =>
    group.items.map(
      (item) =>
        [
          item.id,
          { ...item, groupId: group.id, groupLabel: group.label },
        ] as const,
    ),
  ),
);

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return SECTION_BY_ID.has(value as SettingsSectionId);
}

export function getSettingsSection(id: string) {
  return SECTION_BY_ID.get(id as SettingsSectionId);
}

export function settingsSectionPath(section: SettingsSectionId): string {
  const ws = currentWorkspaceSlugs();
  if (ws) {
    return portalWorkspacePath({
      ...ws,
      surface: "settings",
      settingsRest: section,
    });
  }
  return `${PORTAL_PATHS.settings}${section}/`;
}

/** Gallery / starter picker before opening the full-page builder. */
export function templateBuilderNewPath(): string {
  const ws = currentWorkspaceSlugs();
  if (ws) {
    return portalWorkspacePath({
      ...ws,
      surface: "settings",
      settingsRest: "templates/new",
    });
  }
  return `${PORTAL_PATHS.settings}templates/new/`;
}

/** Full-page create builder. Pass a catalog starter id, or `draft=1` after HTML paste. */
export function templateBuilderCreatePath(options?: {
  starterId?: string;
  draft?: boolean;
}): string {
  const ws = currentWorkspaceSlugs();
  const base = ws
    ? portalWorkspacePath({
        ...ws,
        surface: "settings",
        settingsRest: "templates/builder",
      })
    : `${PORTAL_PATHS.settings}templates/builder/`;
  const params = new URLSearchParams();
  if (options?.starterId) params.set("starter", options.starterId);
  if (options?.draft) params.set("draft", "1");
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function templateBuilderEditPath(id: string): string {
  const ws = currentWorkspaceSlugs();
  const base = ws
    ? portalWorkspacePath({
        ...ws,
        surface: "settings",
        settingsRest: "templates/edit",
      })
    : `${PORTAL_PATHS.settings}templates/edit/`;
  return `${base}?id=${encodeURIComponent(id)}`;
}

/** True when Settings chrome should hide for a Zoho-style full-page builder. */
export function isTemplateBuilderImmersivePath(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  const normalized = pathname.replace(/\/$/, "");
  return (
    normalized.endsWith("/templates/builder") ||
    normalized.endsWith("/templates/edit") ||
    normalized.endsWith("/templates/new")
  );
}

export const TEMPLATE_BUILDER_DRAFT_STORAGE_KEY =
  "trashbox.emailTemplateBuilderDraft";

export interface TemplateBuilderDraftPayload {
  name: string;
  subject: string;
  document: unknown;
}

export function settingsGroupForSection(section: SettingsSectionId) {
  return PORTAL_SETTINGS_NAV.find((group) =>
    group.items.some((item) => item.id === section),
  );
}
