import type { Metadata } from "next";
import { PlatformOverview } from "@/components/features/marketing/PlatformOverview";

export const metadata: Metadata = {
  title: "Trashbox CRM",
  description:
    "Trashbox CRM for customer retention and lead generation—email templates, messaging, lead management, and secure teams.",
  openGraph: {
    title: "Trashbox LLC - Trashbox CRM",
  },
};

export default function PlatformHubPage() {
  return <PlatformOverview />;
}
