import { isPortalAuthPath } from "@/lib/portal-auth";
import { PORTAL_PATHS } from "@/lib/sites";

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

/** Org selection / create layer (before main portal content). */
export function isPortalOrgPickerPath(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  return normalizePath(pathname) === normalizePath(PORTAL_PATHS.orgs);
}

/** Signed-in product surfaces that require an organization context. */
export function isPortalProductPath(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  if (isPortalAuthPath(pathname) || isPortalOrgPickerPath(pathname)) {
    return false;
  }
  const path = normalizePath(pathname);
  return (
    path === normalizePath(PORTAL_PATHS.home) ||
    path === normalizePath(PORTAL_PATHS.inbox) ||
    path === normalizePath(PORTAL_PATHS.membership) ||
    path.startsWith(normalizePath(PORTAL_PATHS.settings))
  );
}

/**
 * When the user has no selected organization, product routes bounce to the
 * org picker. Returns null when the user may stay on the current path.
 */
export function portalOrgGateRedirect(
  pathname: string | null | undefined,
  hasSelectedOrg: boolean,
): string | null {
  if (hasSelectedOrg) return null;
  if (!isPortalProductPath(pathname)) return null;
  return PORTAL_PATHS.orgs;
}
