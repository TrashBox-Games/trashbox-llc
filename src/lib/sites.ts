/** Marketing Platform + signed-in Portal path helpers. */

export const API_DOCS_URL = "https://api.trashbox.io/docs";

/** Production base URL for the Form API (matches the OpenAPI `servers` entry). */
export const API_BASE_URL = "https://api.trashbox.io";

export const PLATFORM_BASE = "/platform";
export const PORTAL_BASE = "/portal";

export const PLATFORM_PATHS = {
  hub: "/platform/",
  features: "/platform/features/",
  pricing: "/platform/pricing/",
  api: "/platform/api/",
  documentation: "/platform/documentation/",
} as const;

export const PORTAL_PATHS = {
  root: "/portal/",
  /** Org picker — select or create an organization before product surfaces. */
  orgs: "/portal/orgs/",
  /** Workspace home for the selected organization (projects). */
  home: "/portal/",
  login: "/portal/login/",
  signup: "/portal/signup/",
  confirm: "/portal/confirm/",
  forgotPassword: "/portal/forgot-password/",
  inbox: "/portal/inbox/",
  apiKey: "/portal/settings/api-keys/",
  membership: "/portal/membership/",
  team: "/portal/settings/members/",
  settings: "/portal/settings/",
} as const;

export function isPlatformPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === PLATFORM_BASE || pathname.startsWith(`${PLATFORM_BASE}/`)
  );
}

export function isPortalPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === PORTAL_BASE || pathname.startsWith(`${PORTAL_BASE}/`);
}
