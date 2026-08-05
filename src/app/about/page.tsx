import type { Metadata } from "next";
import { AboutPage } from "@/components/features/marketing/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Trashbox LLC was founded in 2025 in Kingwood, TX by Ezekiel Mohr to bring excellent software to businesses of every size.",
  openGraph: {
    title: "Trashbox LLC - About",
    description:
      "Meet the studio behind Trashbox—engineering for businesses that deserve more than off-the-shelf.",
  },
};

export default function Page() {
  return <AboutPage />;
}
