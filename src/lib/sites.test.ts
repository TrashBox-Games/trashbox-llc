import { describe, expect, it, vi } from "vitest";
import {
  PLATFORM_PATHS,
  PORTAL_PATHS,
  isPlatformPath,
  isPortalPath,
  portalUrl,
} from "./sites";

describe("sites helpers", () => {
  it("exposes platform and portal paths", () => {
    expect(PLATFORM_PATHS.features).toBe("/platform/features/");
    expect(PORTAL_PATHS.login).toBe("/portal/login/");
    expect(PORTAL_PATHS.inbox).toBe("/portal/inbox/");
    expect(PORTAL_PATHS.apiKey).toBe("/portal/api-key/");
    expect(PORTAL_PATHS.membership).toBe("/portal/membership/");
  });

  it("detects platform vs portal paths", () => {
    expect(isPlatformPath("/platform/pricing/")).toBe(true);
    expect(isPortalPath("/portal/inbox/")).toBe(true);
    expect(isPortalPath("/platform")).toBe(false);
  });

  it("builds absolute portal URLs from NEXT_PUBLIC_PORTAL_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_PORTAL_URL", "https://trashbox.io/portal");
    expect(portalUrl("login")).toBe("https://trashbox.io/portal/login/");
    expect(portalUrl("inbox")).toBe("https://trashbox.io/portal/inbox/");
    expect(portalUrl("membership")).toBe(
      "https://trashbox.io/portal/membership/",
    );
  });
});
