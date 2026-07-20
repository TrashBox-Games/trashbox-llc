import { SettingsShell } from "@/components/organisms/SettingsShell";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SettingsShell>{children}</SettingsShell>;
}
