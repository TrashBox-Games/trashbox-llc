import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPendingSignupPassword,
  getPendingSignupPassword,
  isPortalAuthPath,
  pendingConfirmPath,
  setPendingSignupPassword,
} from "./portal-auth";

describe("isPortalAuthPath", () => {
  it("recognizes login, signup, confirm, and forgot-password", () => {
    expect(isPortalAuthPath("/portal/login")).toBe(true);
    expect(isPortalAuthPath("/portal/login/")).toBe(true);
    expect(isPortalAuthPath("/portal/signup/")).toBe(true);
    expect(isPortalAuthPath("/portal/confirm")).toBe(true);
    expect(isPortalAuthPath("/portal/forgot-password/")).toBe(true);
  });

  it("rejects product routes and nullish values", () => {
    expect(isPortalAuthPath("/portal/")).toBe(false);
    expect(isPortalAuthPath("/portal/inbox/")).toBe(false);
    expect(isPortalAuthPath("/portal/settings/")).toBe(false);
    expect(isPortalAuthPath(null)).toBe(false);
    expect(isPortalAuthPath(undefined)).toBe(false);
  });
});

describe("pendingConfirmPath", () => {
  it("builds confirm URL with email query", () => {
    expect(pendingConfirmPath("Owner@Example.com")).toBe(
      "/portal/confirm/?email=owner%40example.com",
    );
  });
});

describe("pending signup password storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("stores and clears password for post-confirm auto sign-in", () => {
    setPendingSignupPassword("Owner@Example.com", "secret-pass");
    expect(getPendingSignupPassword("owner@example.com")).toBe("secret-pass");
    expect(getPendingSignupPassword("other@example.com")).toBe(null);
    clearPendingSignupPassword();
    expect(getPendingSignupPassword("owner@example.com")).toBe(null);
  });
});
