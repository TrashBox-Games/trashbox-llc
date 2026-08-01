import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/portal/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your Trashbox portal password.",
};

export default function Page() {
  return <ForgotPasswordForm />;
}
