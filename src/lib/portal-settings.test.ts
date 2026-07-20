import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS_SECTION,
  PORTAL_SETTINGS_NAV,
  getSettingsSection,
  isSettingsSectionId,
  settingsSectionPath,
} from "./portal-settings";
import { PORTAL_PATHS } from "./sites";

describe("portal-settings", () => {
  it("defines the full settings sidebar groups", () => {
    expect(PORTAL_SETTINGS_NAV.map((g) => g.id)).toEqual([
      "workspace",
      "team",
      "communication",
      "crm",
      "automation",
      "developers",
      "billing",
      "security",
    ]);
  });

  it("includes email accounts under communication", () => {
    const communication = PORTAL_SETTINGS_NAV.find((g) => g.id === "communication");
    expect(communication?.items.map((i) => i.id)).toContain("email-accounts");
  });

  it("builds section paths under /portal/settings", () => {
    expect(settingsSectionPath("email-accounts")).toBe(
      "/portal/settings/email-accounts/",
    );
    expect(settingsSectionPath(DEFAULT_SETTINGS_SECTION)).toBe(
      `${PORTAL_PATHS.settings}${DEFAULT_SETTINGS_SECTION}/`,
    );
  });

  it("resolves known sections and rejects unknown ones", () => {
    expect(isSettingsSectionId("general")).toBe(true);
    expect(isSettingsSectionId("not-a-section")).toBe(false);
    expect(getSettingsSection("email-accounts")?.label).toBe("Email Accounts");
    expect(getSettingsSection("missing")).toBeUndefined();
  });

  it("lists every section id for static export params", () => {
    const sections = PORTAL_SETTINGS_NAV.flatMap((group) =>
      group.items.map((item) => item.id),
    );
    expect(sections).toContain("general");
    expect(sections).toContain("email-accounts");
    expect(new Set(sections).size).toBe(sections.length);
  });
});
