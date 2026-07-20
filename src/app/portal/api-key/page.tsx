import { redirect } from "next/navigation";
import { settingsSectionPath } from "@/lib/portal-settings";

/** Legacy /portal/api-key → Settings → Developers → API Keys. */
export default function PortalApiKeyRedirectPage() {
  redirect(settingsSectionPath("api-keys"));
}
