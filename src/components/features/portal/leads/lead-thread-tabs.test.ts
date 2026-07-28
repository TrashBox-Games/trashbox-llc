import { afterEach, describe, expect, it } from "vitest";
import {
  closeLeadTab,
  LEAD_THREAD_TABS_STORAGE_KEY,
  loadLeadThreadTabs,
  openLeadTab,
  parseLeadThreadTabs,
  saveLeadThreadTabs,
  serializeLeadThreadTabs,
} from "./lead-thread-tabs";

describe("openLeadTab", () => {
  it("appends a new tab id", () => {
    expect(openLeadTab(["s1"], "s2")).toEqual(["s1", "s2"]);
  });

  it("does not duplicate an already-open tab", () => {
    expect(openLeadTab(["s1", "s2"], "s1")).toEqual(["s1", "s2"]);
  });

  it("opens the first tab from an empty list", () => {
    expect(openLeadTab([], "s1")).toEqual(["s1"]);
  });
});

describe("closeLeadTab", () => {
  it("removes the tab and keeps the active id when another tab was active", () => {
    expect(closeLeadTab(["s1", "s2", "s3"], "s1", "s2")).toEqual({
      openTabIds: ["s1", "s3"],
      activeId: "s1",
    });
  });

  it("selects the next tab when closing the active tab", () => {
    expect(closeLeadTab(["s1", "s2", "s3"], "s2", "s2")).toEqual({
      openTabIds: ["s1", "s3"],
      activeId: "s3",
    });
  });

  it("selects the previous tab when closing the last active tab", () => {
    expect(closeLeadTab(["s1", "s2", "s3"], "s3", "s3")).toEqual({
      openTabIds: ["s1", "s2"],
      activeId: "s2",
    });
  });

  it("clears selection when closing the only tab", () => {
    expect(closeLeadTab(["s1"], "s1", "s1")).toEqual({
      openTabIds: [],
      activeId: null,
    });
  });

  it("is a no-op when the tab id is not open", () => {
    expect(closeLeadTab(["s1", "s2"], "s1", "s9")).toEqual({
      openTabIds: ["s1", "s2"],
      activeId: "s1",
    });
  });
});

describe("parseLeadThreadTabs", () => {
  it("returns empty state for null input", () => {
    expect(parseLeadThreadTabs(null)).toEqual({
      openTabIds: [],
      activeId: null,
    });
  });

  it("parses a valid stored payload", () => {
    expect(
      parseLeadThreadTabs(
        JSON.stringify({ openTabIds: ["s1", "s2"], activeId: "s2" }),
      ),
    ).toEqual({ openTabIds: ["s1", "s2"], activeId: "s2" });
  });

  it("returns empty state for invalid json", () => {
    expect(parseLeadThreadTabs("{not-json")).toEqual({
      openTabIds: [],
      activeId: null,
    });
  });

  it("returns empty state when shape is wrong", () => {
    expect(parseLeadThreadTabs(JSON.stringify({ tabs: ["s1"] }))).toEqual({
      openTabIds: [],
      activeId: null,
    });
  });

  it("allows null activeId with open tabs", () => {
    expect(
      parseLeadThreadTabs(
        JSON.stringify({ openTabIds: ["s1"], activeId: null }),
      ),
    ).toEqual({ openTabIds: ["s1"], activeId: null });
  });
});

describe("serializeLeadThreadTabs", () => {
  it("round-trips through parse", () => {
    const state = { openTabIds: ["a", "b"], activeId: "a" as string | null };
    expect(parseLeadThreadTabs(serializeLeadThreadTabs(state))).toEqual(state);
  });
});

describe("loadLeadThreadTabs / saveLeadThreadTabs", () => {
  afterEach(() => {
    localStorage.removeItem(LEAD_THREAD_TABS_STORAGE_KEY);
  });

  it("loads empty state when nothing is stored", () => {
    expect(loadLeadThreadTabs()).toEqual({
      openTabIds: [],
      activeId: null,
    });
  });

  it("persists and reloads tab state", () => {
    saveLeadThreadTabs({ openTabIds: ["s1", "s3"], activeId: "s3" });
    expect(loadLeadThreadTabs()).toEqual({
      openTabIds: ["s1", "s3"],
      activeId: "s3",
    });
  });
});
