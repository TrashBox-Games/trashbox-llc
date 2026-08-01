import { redirect } from "next/navigation";
import { PORTAL_PATHS } from "@/lib/sites";

/**
 * Legacy /portal/team → org picker. Preserves `?invite=` for accept flow.
 * Team management lives under `/portal/{orgSlug}/settings/members/`.
 */
export default async function PortalTeamRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const params = await searchParams;
  const invite = params.invite?.trim();
  if (invite) {
    redirect(
      `${PORTAL_PATHS.orgs}?invite=${encodeURIComponent(invite)}`,
    );
  }
  redirect(PORTAL_PATHS.orgs);
}
