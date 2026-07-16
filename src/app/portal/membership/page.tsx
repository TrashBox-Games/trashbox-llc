import type { Metadata } from "next";
import { PortalApp } from "@/components/organisms/PortalPage";

export const metadata: Metadata = {
  title: "Portal Membership",
  description: "Manage your Form API subscription.",
};

export default function Page() {
  return <PortalApp tab="membership" />;
}
