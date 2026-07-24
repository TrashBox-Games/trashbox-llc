import type { Metadata } from "next";
import { PortalApp } from "@/components/features/portal/leads/PortalPage";

export const metadata: Metadata = {
  title: "Portal Inbox",
  description: "Form submission notifications inbox.",
};

export default function Page() {
  return <PortalApp tab="inbox" />;
}
