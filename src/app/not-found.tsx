import type { Metadata } from "next";
import { NotFoundContent } from "@/components/features/marketing/NotFoundContent";

export const metadata: Metadata = {
  title: "404",
  description: "This page could not be found.",
  robots: { index: false },
  openGraph: {
    title: "404 — Trashbox LLC",
  },
};

export default function NotFound() {
  return <NotFoundContent />;
}
