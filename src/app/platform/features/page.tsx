import type { Metadata } from "next";
import { PlatformFeatures } from "@/components/features/marketing/PlatformFeatures";

export const metadata: Metadata = {
  title: "Trashbox CRM Features",
  description:
    "Lead management, email templates that boost response rates by 40%, messaging, and secure team management.",
};

export default function PortalFeaturesPage() {
  return <PlatformFeatures />;
}
