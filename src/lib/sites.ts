/** Marketing Platform + signed-in Portal path helpers. */

export const API_DOCS_URL = "https://api.trashbox.io/docs";

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
  login: "/portal/login/",
  inbox: "/portal/inbox/",
  apiKey: "/portal/api-key/",
  membership: "/portal/membership/",
  team: "/portal/team/",
} as const;

export function isPlatformPath(pathname: string): boolean {
  return (
    pathname === PLATFORM_BASE || pathname.startsWith(`${PLATFORM_BASE}/`)
  );
}

export function isPortalPath(pathname: string): boolean {
  return pathname === PORTAL_BASE || pathname.startsWith(`${PORTAL_BASE}/`);
}
