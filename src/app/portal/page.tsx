"use client";

import { useEffect } from "react";
import { PortalSkeleton } from "@/components/organisms/PortalSkeleton";
import { useAuth } from "@/lib/auth";
import { PORTAL_PATHS } from "@/lib/sites";

/** /portal → inbox if signed in, otherwise login. */
export default function PortalIndexPage() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "signedIn") {
      window.location.replace(PORTAL_PATHS.inbox);
    } else if (auth.status === "signedOut") {
      window.location.replace(PORTAL_PATHS.login);
    }
  }, [auth.status]);

  return (
    <div className="space-y-10">
      <header>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
          Inbox
        </p>
        <h1 className="max-w-4xl font-headline text-4xl font-bold leading-tight tracking-tighter text-white md:text-6xl">
          Notifications <span className="text-outline">Inbox.</span>
        </h1>
      </header>
      <PortalSkeleton variant="inbox" />
    </div>
  );
}
