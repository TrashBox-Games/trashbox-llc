import { redirect } from "next/navigation";
import {
  DEFAULT_SETTINGS_SECTION,
  settingsSectionPath,
} from "@/lib/portal-settings";

export default function PortalSettingsIndexPage() {
  redirect(settingsSectionPath(DEFAULT_SETTINGS_SECTION));
}
