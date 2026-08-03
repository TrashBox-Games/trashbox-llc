import type { Metadata } from "next";
import { AccountSettings } from "@/components/features/portal/account/AccountSettings";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your Trashbox account.",
};

export default function PortalAccountPage() {
  return <AccountSettings />;
}
