import type { Metadata } from "next";
import { LoginForm } from "@/components/features/portal/auth/LoginForm";

export const metadata: Metadata = {
  title: "Portal Login",
  description: "Sign in to the Trashbox Form API portal.",
};

export default function Page() {
  return <LoginForm />;
}
