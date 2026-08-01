import { LegacyPortalRedirect } from "@/components/features/portal/LegacyPortalRedirect";
import { SettingsShell } from "@/components/features/portal/settings/SettingsShell";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LegacyPortalRedirect />
      <SettingsShell>{children}</SettingsShell>
    </>
  );
}
