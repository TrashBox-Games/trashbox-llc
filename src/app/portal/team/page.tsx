import { redirect } from "next/navigation";
import { settingsSectionPath } from "@/lib/portal-settings";

/** Legacy /portal/team → Settings → Members. */
export default function PortalTeamRedirectPage() {
  redirect(settingsSectionPath("members"));
}
