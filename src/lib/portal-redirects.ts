import { isPortalAuthPath } from "@/lib/portal-auth";
import { PORTAL_PATHS } from "@/lib/sites";

/** Where to send a signed-out user, or null if they may stay. */
export function portalSignedOutRedirect(
  pathname: string | null | undefined,
): string | null {
  if (isPortalAuthPath(pathname)) return null;
  return PORTAL_PATHS.login;
}

/** Where to send a signed-in user on an auth route, or null if they may stay. */
export function portalSignedInAuthRedirect(
  pathname: string | null | undefined,
): string | null {
  if (!isPortalAuthPath(pathname)) return null;
  return PORTAL_PATHS.home;
}
