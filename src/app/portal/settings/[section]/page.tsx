import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SettingsSectionContent } from "@/components/features/settings/SettingsSectionContent";
import {
  PORTAL_SETTINGS_NAV,
  getSettingsSection,
  isSettingsSectionId,
} from "@/lib/portal-settings";

interface PageProps {
  params: Promise<{ section: string }>;
}

export function generateStaticParams() {
  return PORTAL_SETTINGS_NAV.flatMap((group) =>
    group.items.map((item) => ({ section: item.id })),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { section } = await params;
  const meta = isSettingsSectionId(section)
    ? getSettingsSection(section)
    : undefined;
  return {
    title: meta ? `Settings · ${meta.label}` : "Settings",
    description: "Portal workspace settings.",
  };
}

export default async function PortalSettingsSectionPage({ params }: PageProps) {
  const { section } = await params;
  if (!isSettingsSectionId(section)) notFound();

  return <SettingsSectionContent sectionId={section} />;
}
