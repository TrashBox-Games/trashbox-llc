import type { Metadata } from "next";
import { SignupForm } from "@/components/features/portal/auth/SignupForm";

export const metadata: Metadata = {
  title: "Portal Sign up",
  description: "Create a Trashbox Form API portal account.",
};

export default function Page() {
  return <SignupForm />;
}
