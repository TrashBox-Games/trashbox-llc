import { describe, expect, it } from "vitest";
import { settingsSectionPath } from "./portal-settings";
import {
  PLATFORM_PATHS,
  PORTAL_PATHS,
  isPlatformPath,
  isPortalPath,
} from "./sites";

describe("sites helpers", () => {
  it("exposes platform and portal paths", () => {
    expect(PLATFORM_PATHS.features).toBe("/platform/features/");
    expect(PORTAL_PATHS.login).toBe("/portal/login/");
    expect(PORTAL_PATHS.inbox).toBe("/portal/inbox/");
    expect(PORTAL_PATHS.apiKey).toBe("/portal/api-key/");
    expect(PORTAL_PATHS.membership).toBe("/portal/membership/");
    expect(PORTAL_PATHS.team).toBe("/portal/team/");
    expect(PORTAL_PATHS.settings).toBe("/portal/settings/");
    expect(settingsSectionPath("email-accounts")).toBe(
      "/portal/settings/email-accounts/",
    );
  });

  it("detects platform vs portal paths", () => {
    expect(isPlatformPath("/platform/pricing/")).toBe(true);
    expect(isPortalPath("/portal/inbox/")).toBe(true);
    expect(isPortalPath("/platform")).toBe(false);
  });
});
