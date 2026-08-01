import { describe, expect, it } from "vitest";
import {
  isPortalOrgPickerPath,
  isPortalProductPath,
  portalOrgGateRedirect,
} from "./portal-org-gate";

describe("portal org gate", () => {
  it("treats /portal/orgs as the picker", () => {
    expect(isPortalOrgPickerPath("/portal/orgs")).toBe(true);
    expect(isPortalOrgPickerPath("/portal/orgs/")).toBe(true);
    expect(isPortalOrgPickerPath("/portal/")).toBe(false);
  });

  it("treats inbox/settings/membership/home and slug workspaces as product surfaces", () => {
    expect(isPortalProductPath("/portal/")).toBe(true);
    expect(isPortalProductPath("/portal/inbox/")).toBe(true);
    expect(isPortalProductPath("/portal/settings/api-keys/")).toBe(true);
    expect(isPortalProductPath("/portal/membership/")).toBe(true);
    expect(isPortalProductPath("/portal/acme/")).toBe(true);
    expect(isPortalProductPath("/portal/acme/site/inbox/")).toBe(true);
    expect(isPortalProductPath("/portal/orgs/")).toBe(false);
    expect(isPortalProductPath("/portal/login/")).toBe(false);
  });

  it("sends legacy product routes to the org picker when no org is selected", () => {
    expect(portalOrgGateRedirect("/portal/inbox/", false)).toBe(
      "/portal/orgs/",
    );
    expect(portalOrgGateRedirect("/portal/", false)).toBe("/portal/orgs/");
    expect(portalOrgGateRedirect("/portal/orgs/", false)).toBe(null);
    expect(portalOrgGateRedirect("/portal/inbox/", true)).toBe(null);
    expect(portalOrgGateRedirect("/portal/login/", false)).toBe(null);
    expect(portalOrgGateRedirect("/portal/acme/site/inbox/", false)).toBe(
      null,
    );
  });
});
