import { isPortalAuthPath } from "@/lib/portal-auth";
import {
  isLegacyPortalProductPath,
  isPortalWorkspacePath,
} from "@/lib/portal-routes";
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
  if (isPortalWorkspacePath(pathname)) return true;
  return isLegacyPortalProductPath(pathname);
}

/**
 * When the user has no selected organization, legacy flat product routes bounce
 * to the org picker. Slug workspace paths resolve org from the URL instead.
 */
export function portalOrgGateRedirect(
  pathname: string | null | undefined,
  hasSelectedOrg: boolean,
): string | null {
  if (hasSelectedOrg) return null;
  if (isPortalWorkspacePath(pathname)) return null;
  if (!isLegacyPortalProductPath(pathname)) return null;
  return PORTAL_PATHS.orgs;
}
