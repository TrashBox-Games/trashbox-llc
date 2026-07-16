import type { Metadata } from "next";
import { EmailPortalPage } from "@/components/organisms/EmailPortalPage";

export const metadata: Metadata = {
  title: "Email Portal",
  description: "Sign in to view form submissions for your Trashbox Email Service account.",
  openGraph: {
    title: "Trashbox LLC - Email Portal",
  },
};

export default function Page() {
  return <EmailPortalPage />;
}
