import type { Metadata } from "next";
import { OrgPicker } from "@/components/features/portal/orgs/OrgPicker";

export const metadata: Metadata = {
  title: "Organizations",
  description: "Choose or create a Trashbox organization.",
};

export default function PortalOrgsPage() {
  return <OrgPicker />;
}
