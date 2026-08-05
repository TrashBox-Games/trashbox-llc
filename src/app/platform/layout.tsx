import { PlatformNav } from "@/components/features/marketing/PlatformNav";

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PlatformNav />
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-8 pt-28 pb-24 md:pt-32">
        {children}
      </main>
    </div>
  );
}
