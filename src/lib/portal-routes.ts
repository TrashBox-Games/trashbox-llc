import { PORTAL_BASE, PORTAL_PATHS } from "@/lib/sites";

/**
 * First path segment after `/portal/` reserved for auth, org picker, and
 * legacy flat product routes (so they are never treated as org slugs).
 */
export const RESERVED_ORG_SLUGS = new Set([
  "login",
  "signup",
  "confirm",
  "forgot-password",
  "orgs",
  "inbox",
  "membership",
  "settings",
  "team",
  "api-key",
]);

export type PortalWorkspaceSurface =
  | "orgHome"
  | "projectHome"
  | "inbox"
  | "settings"
  | "membership";

export type ParsedPortalWorkspacePath = {
  orgSlug: string;
  projectSlug?: string;
  surface: PortalWorkspaceSurface;
  /** Path under settings/ without leading/trailing slashes (e.g. `api-keys`). */
  settingsRest?: string;
};

const PORTAL_NAVIGATE_EVENT = "portal:navigate";

export function slugifyPortalSegment(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "item";
}

function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") return "/";
  return trimmed.replace(/\/+$/, "") || "/";
}

function splitPortalSegments(pathname: string): string[] {
  const normalized = normalizePathname(pathname);
  const parts = normalized.split("/").filter(Boolean);
  if (parts[0] !== "portal") return [];
  return parts.slice(1);
}

export function isReservedOrgSlug(slug: string): boolean {
  return RESERVED_ORG_SLUGS.has(slug);
}

/** Parse GitHub-style workspace paths under `/portal/{org}/{project?}/…`. */
export function parsePortalWorkspacePath(
  pathname: string | null | undefined,
): ParsedPortalWorkspacePath | null {
  if (!pathname) return null;
  const segments = splitPortalSegments(pathname);
  if (segments.length === 0) return null;

  const [orgSlug, projectSlug, surfaceSeg, ...rest] = segments;
  if (!orgSlug || isReservedOrgSlug(orgSlug)) return null;

  if (!projectSlug) {
    return { orgSlug, surface: "orgHome" };
  }

  if (!surfaceSeg) {
    return { orgSlug, projectSlug, surface: "projectHome" };
  }

  if (surfaceSeg === "inbox" && rest.length === 0) {
    return { orgSlug, projectSlug, surface: "inbox" };
  }
  if (surfaceSeg === "membership" && rest.length === 0) {
    return { orgSlug, projectSlug, surface: "membership" };
  }
  if (surfaceSeg === "settings") {
    return {
      orgSlug,
      projectSlug,
      surface: "settings",
      settingsRest: rest.join("/"),
    };
  }

  return null;
}

export function portalWorkspacePath(input: {
  orgSlug: string;
  projectSlug?: string;
  surface: PortalWorkspaceSurface;
  settingsRest?: string;
}): string {
  const org = encodeURIComponent(input.orgSlug);
  const base = `${PORTAL_BASE}/${org}`;
  if (input.surface === "orgHome" || !input.projectSlug) {
    return `${base}/`;
  }
  const project = encodeURIComponent(input.projectSlug);
  const projectBase = `${base}/${project}`;
  switch (input.surface) {
    case "projectHome":
      return `${projectBase}/`;
    case "inbox":
      return `${projectBase}/inbox/`;
    case "membership":
      return `${projectBase}/membership/`;
    case "settings": {
      const rest = (input.settingsRest || "").replace(/^\/+|\/+$/g, "");
      return rest
        ? `${projectBase}/settings/${rest}/`
        : `${projectBase}/settings/`;
    }
    default:
      return `${projectBase}/`;
  }
}

/** True when pathname is a slug-scoped product workspace path. */
export function isPortalWorkspacePath(
  pathname: string | null | undefined,
): boolean {
  return parsePortalWorkspacePath(pathname) !== null;
}

/**
 * Legacy flat product paths that should redirect into slug URLs
 * (or the org picker when no workspace is selected).
 */
export function isLegacyPortalProductPath(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  const path = normalizePathname(pathname);
  const home = normalizePathname(PORTAL_PATHS.home);
  const inbox = normalizePathname(PORTAL_PATHS.inbox);
  const membership = normalizePathname(PORTAL_PATHS.membership);
  const settings = normalizePathname(PORTAL_PATHS.settings);
  return (
    path === home ||
    path === inbox ||
    path === membership ||
    path === settings ||
    path.startsWith(`${settings}/`)
  );
}

export function portalNavigate(
  path: string,
  options?: { replace?: boolean },
): void {
  if (typeof window === "undefined") return;
  const next = path.startsWith("/") ? path : `/${path}`;
  const method = options?.replace ? "replaceState" : "pushState";
  window.history[method](null, "", next);
  window.dispatchEvent(
    new CustomEvent(PORTAL_NAVIGATE_EVENT, { detail: { path: next } }),
  );
}

export function subscribePortalNavigate(
  listener: (path: string) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ path: string }>).detail;
    listener(detail?.path || window.location.pathname);
  };
  window.addEventListener(PORTAL_NAVIGATE_EVENT, handler);
  window.addEventListener("popstate", () => {
    listener(window.location.pathname);
  });
  return () => {
    window.removeEventListener(PORTAL_NAVIGATE_EVENT, handler);
  };
}
