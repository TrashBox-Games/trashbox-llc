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

  return <PortalSkeleton variant="inbox" />;
}
