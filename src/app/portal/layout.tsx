import { PortalHeader } from "@/components/organisms/PortalHeader";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PortalHeader />
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-8 pt-32 pb-24">
        {children}
      </main>
    </>
  );
}
