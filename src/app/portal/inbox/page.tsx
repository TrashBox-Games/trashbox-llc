import type { Metadata } from "next";
import { LegacyPortalRedirect } from "@/components/features/portal/LegacyPortalRedirect";
import { PortalApp } from "@/components/features/portal/leads/PortalPage";

export const metadata: Metadata = {
  title: "Portal Inbox",
  description: "Form submission notifications inbox.",
};

export default function Page() {
  return (
    <>
      <LegacyPortalRedirect />
      <PortalApp tab="inbox" />
    </>
  );
}
