import { beforeEach, describe, expect, it } from "vitest";
import {
  getSelectedOrgId,
  getSelectedProjectId,
  setSelectedWorkspace,
} from "./portal-selection";

describe("portal selection storage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("stores and reads org/project ids", () => {
    setSelectedWorkspace("org1", "proj1");
    expect(getSelectedOrgId()).toBe("org1");
    expect(getSelectedProjectId()).toBe("proj1");
  });

  it("clears selection", () => {
    setSelectedWorkspace("org1", "proj1");
    setSelectedWorkspace(null, null);
    expect(getSelectedOrgId()).toBe(null);
    expect(getSelectedProjectId()).toBe(null);
  });
});
