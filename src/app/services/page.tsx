import type { Metadata } from "next";
import { ServicesPage } from "@/components/features/marketing/ServicesPage";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Websites, web applications, systems, mobile apps, and AI integration—one-off builds and ongoing development from Trashbox LLC.",
  openGraph: {
    title: "Trashbox LLC - Services",
    description:
      "Start a project with Trashbox LLC across websites, apps, systems, and intelligent workflows.",
  },
};

export default function Page() {
  return <ServicesPage />;
}
