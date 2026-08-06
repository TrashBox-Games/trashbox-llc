import type { Metadata } from "next";
import { ServiceOfferingPage } from "@/components/features/marketing/ServiceOfferingPage";
import { getServiceOffering } from "@/components/features/marketing/service-offerings";

const offering = getServiceOffering("mobileApps");

export const metadata: Metadata = {
  title: offering.title,
  description: offering.intro,
  openGraph: {
    title: `Trashbox LLC - ${offering.title}`,
    description: offering.intro,
  },
};

export default function Page() {
  return <ServiceOfferingPage offering={offering} />;
}
