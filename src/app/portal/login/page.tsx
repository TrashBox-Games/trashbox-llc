import type { Metadata } from "next";
import { PortalLoginPage } from "@/components/organisms/PortalPage";

export const metadata: Metadata = {
  title: "Portal Login",
  description: "Sign in to the Trashbox Form API portal.",
};

export default function Page() {
  return <PortalLoginPage />;
}
