import type { Metadata } from "next";
import { TemplateBuilderNewPage } from "@/components/features/portal/settings/template-builder/TemplateBuilderNewPage";

export const metadata: Metadata = {
  title: "Template gallery",
  description: "Choose a starter for the email template builder.",
};

export default function PortalTemplateNewPage() {
  return <TemplateBuilderNewPage />;
}
