import type { Metadata } from "next";
import { ServicesPage } from "@/components/organisms/ServicesPage";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Discover Trashbox LLC services in app design, full-stack development, and AI integration.",
  openGraph: {
    title: "Trashbox LLC - Services",
    description:
      "Start a project with Trashbox LLC across product strategy, engineering, and intelligent systems.",
  },
};

export default function Page() {
  return <ServicesPage />;
}
