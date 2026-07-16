import { PortalHeader } from "@/components/organisms/PortalHeader";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PortalHeader />
      <main className="mx-auto max-w-screen-2xl flex-1 px-8 pt-28 pb-24 md:pt-32">
        {children}
      </main>
    </>
  );
}
