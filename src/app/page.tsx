import type { Metadata } from "next";
import { HomePage } from "@/components/organisms/HomePage";

export const metadata: Metadata = {
  title: "Trashbox",
  description:
    "Trashbox LLC builds high-fidelity digital products through focused engineering, product strategy, and editorial design systems.",
  openGraph: {
    title: "Trashbox LLC - Home",
    description:
      "Explore Trashbox LLC's philosophy, selected outputs, and the next generation of digital tools.",
  },
};

export default function Page() {
  return <HomePage />;
}
