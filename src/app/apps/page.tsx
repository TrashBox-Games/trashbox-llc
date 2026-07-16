import type { Metadata } from "next";
import { AppsPage } from "@/components/organisms/AppsPage";

export const metadata: Metadata = {
  title: "Apps",
  description: "Browse selected mobile and experimental applications from Trashbox LLC.",
  openGraph: {
    title: "Trashbox LLC - Apps",
    description: "Portfolio highlights from Trashbox LLC products and experiments.",
  },
};

export default function Page() {
  return <AppsPage />;
}
