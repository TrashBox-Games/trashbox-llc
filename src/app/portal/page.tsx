import type { Metadata } from "next";
import { PortalHome } from "@/components/features/portal/home/PortalHome";

export const metadata: Metadata = {
  title: "Portal",
  description: "Trashbox Form API portal home.",
};

export default function PortalIndexPage() {
  return <PortalHome />;
}
