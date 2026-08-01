import type { Metadata } from "next";
import { ConfirmForm } from "@/components/features/portal/auth/ConfirmForm";

export const metadata: Metadata = {
  title: "Confirm email",
  description: "Verify your Trashbox portal email address.",
};

export default function Page() {
  return <ConfirmForm />;
}
