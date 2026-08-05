"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";
import { SiteHeader } from "@/components/features/marketing/SiteHeader";
import {
  isPortalWorkspacePath,
  subscribePortalNavigate,
} from "@/lib/portal-routes";
import { isPortalPath, isPlatformPath } from "@/lib/sites";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

/** Marketing chrome; portal and platform routes use their own headers. */
export function MarketingLayout({ children }: MarketingLayoutProps) {
  const nextPath = usePathname();
  const [pathname, setPathname] = useState(nextPath);

  useEffect(() => {
    const win = window.location.pathname;
    // Prefer the real browser path for slug workspace deep links (404 bootstrap).
    if (isPortalWorkspacePath(win)) setPathname(win);
    else setPathname(nextPath || win);
    return subscribePortalNavigate(setPathname);
  }, [nextPath]);

  if (isPortalPath(pathname) || isPlatformPath(pathname)) {
    return <div className="flex min-h-dvh flex-col">{children}</div>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
