import type { Metadata } from "next";
import { PortalApp } from "@/components/organisms/PortalPage";

export const metadata: Metadata = {
  title: "Portal API Key",
  description: "Manage your Form API key.",
};

export default function Page() {
  return <PortalApp tab="api-key" />;
}
