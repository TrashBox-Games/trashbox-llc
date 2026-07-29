import type { Metadata } from "next";
import { TemplateBuilderEditPage } from "@/components/features/portal/settings/template-builder/TemplateBuilderEditPage";

export const metadata: Metadata = {
  title: "Settings · Edit template",
  description: "Edit an email template with the visual builder.",
};

export default function PortalTemplateEditPage() {
  return <TemplateBuilderEditPage />;
}
