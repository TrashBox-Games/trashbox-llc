"use client";

import { useEffect } from "react";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { PORTAL_PATHS } from "@/lib/sites";

/**
 * Legacy /portal/team → org picker. Preserves `?invite=` for accept flow.
 * Team management lives under `/portal/{orgSlug}/settings/members/`.
 *
 * Client-side redirect: static export cannot await `searchParams`.
 */
export default function PortalTeamRedirectPage() {
  useEffect(() => {
    const invite = new URLSearchParams(window.location.search)
      .get("invite")
      ?.trim();
    const target = invite
      ? `${PORTAL_PATHS.orgs}?invite=${encodeURIComponent(invite)}`
      : PORTAL_PATHS.orgs;
    window.location.replace(target);
  }, []);

  return <PortalSkeleton />;
}
