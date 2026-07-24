import { SettingsShell } from "@/components/features/portal/settings/SettingsShell";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SettingsShell>{children}</SettingsShell>;
}
