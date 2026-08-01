import type { Metadata } from "next";
import { LegacyPortalRedirect } from "@/components/features/portal/LegacyPortalRedirect";
import { PortalApp } from "@/components/features/portal/leads/PortalPage";

export const metadata: Metadata = {
  title: "Portal Membership",
  description: "Manage your Form API subscription.",
};

export default function Page() {
  return (
    <>
      <LegacyPortalRedirect />
      <PortalApp tab="membership" />
    </>
  );
}
