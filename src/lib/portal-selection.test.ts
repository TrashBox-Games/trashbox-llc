import { beforeEach, describe, expect, it } from "vitest";
import {
  getSelectedOrgId,
  getSelectedOrgName,
  getSelectedProjectId,
  setSelectedWorkspace,
} from "./portal-selection";

describe("portal selection storage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("stores and reads org/project ids", () => {
    setSelectedWorkspace("org1", "proj1", "Acme Co");
    expect(getSelectedOrgId()).toBe("org1");
    expect(getSelectedProjectId()).toBe("proj1");
    expect(getSelectedOrgName()).toBe("Acme Co");
  });

  it("keeps the org name when updating the same org without a name", () => {
    setSelectedWorkspace("org1", "proj1", "Acme Co");
    setSelectedWorkspace("org1", null);
    expect(getSelectedOrgName()).toBe("Acme Co");
  });

  it("clears selection", () => {
    setSelectedWorkspace("org1", "proj1", "Acme Co");
    setSelectedWorkspace(null, null);
    expect(getSelectedOrgId()).toBe(null);
    expect(getSelectedProjectId()).toBe(null);
    expect(getSelectedOrgName()).toBe(null);
  });
});
