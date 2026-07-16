/** Marketing Platform + signed-in Portal URL helpers. */

export const MARKETING_ORIGIN = "https://trashbox.io";
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
} as const;

/**
 * Absolute portal URL for Login CTAs.
 * `NEXT_PUBLIC_PORTAL_URL` should be the portal root (e.g. https://trashbox.io/portal).
 */
export function portalUrl(
  path: keyof typeof PORTAL_PATHS = "login",
): string {
  const root =
    process.env.NEXT_PUBLIC_PORTAL_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/portal`
      : `${MARKETING_ORIGIN}/portal`);

  const suffix = PORTAL_PATHS[path]
    .replace(/^\/portal\/?/, "")
    .replace(/\/$/, "");

  if (!suffix) return `${root}/`;
  return `${root}/${suffix}/`;
}

export function isPlatformPath(pathname: string): boolean {
  return (
    pathname === PLATFORM_BASE || pathname.startsWith(`${PLATFORM_BASE}/`)
  );
}

export function isPortalPath(pathname: string): boolean {
  return pathname === PORTAL_BASE || pathname.startsWith(`${PORTAL_BASE}/`);
}
