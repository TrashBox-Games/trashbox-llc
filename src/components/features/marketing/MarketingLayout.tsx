"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";
import { SiteHeader } from "@/components/features/marketing/SiteHeader";
import { isPortalPath } from "@/lib/sites";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

/** Marketing chrome; portal routes use PortalHeader instead. */
export function MarketingLayout({ children }: MarketingLayoutProps) {
  const pathname = usePathname();

  if (isPortalPath(pathname)) {
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
