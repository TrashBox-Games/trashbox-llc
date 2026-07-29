import type { Metadata } from "next";
import { TemplateBuilderCreatePage } from "@/components/features/portal/settings/template-builder/TemplateBuilderCreatePage";

export const metadata: Metadata = {
  title: "Template builder",
  description: "Build an email template with the visual editor.",
};

export default function PortalTemplateBuilderPage() {
  return <TemplateBuilderCreatePage />;
}
