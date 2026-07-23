import type { Metadata } from "next";
import { EmailRedirect } from "@/components/features/email/EmailRedirect";

export const metadata: Metadata = {
  title: "Platform",
  description: "Redirecting to the Trashbox Platform.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <EmailRedirect />;
}
