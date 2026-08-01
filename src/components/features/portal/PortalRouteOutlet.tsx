"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PortalWorkspaceApp } from "@/components/features/portal/PortalWorkspaceApp";
import {
  isPortalWorkspacePath,
  subscribePortalNavigate,
} from "@/lib/portal-routes";

/**
 * When the browser path is a GitHub-style workspace URL, render the SPA
 * workspace app instead of the static page child (orgs/auth/legacy).
 */
export function PortalRouteOutlet({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "",
  );

  useEffect(() => {
    setPath(window.location.pathname);
    return subscribePortalNavigate(setPath);
  }, []);

  if (isPortalWorkspacePath(path)) {
    return <PortalWorkspaceApp pathname={path} />;
  }

  return children;
}
