import { PlatformNav } from "@/components/features/marketing/PlatformNav";

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto max-w-screen-2xl px-8 pt-32 pb-24">
      <PlatformNav />
      {children}
    </div>
  );
}
