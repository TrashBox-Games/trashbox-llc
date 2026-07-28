/** Opens a lead tab, appending if it is not already open. */
export function openLeadTab(openTabIds: string[], id: string): string[] {
  if (openTabIds.includes(id)) return openTabIds;
  return [...openTabIds, id];
}

export interface CloseLeadTabResult {
  openTabIds: string[];
  activeId: string | null;
}

/**
 * Closes a lead tab. When the closed tab was active, focuses the next tab
 * (or the previous one if it was last). Clears selection when none remain.
 */
export function closeLeadTab(
  openTabIds: string[],
  activeId: string | null,
  id: string,
): CloseLeadTabResult {
  const index = openTabIds.indexOf(id);
  if (index < 0) {
    return { openTabIds, activeId };
  }

  const nextIds = openTabIds.filter((tabId) => tabId !== id);
  if (activeId !== id) {
    return { openTabIds: nextIds, activeId };
  }

  if (nextIds.length === 0) {
    return { openTabIds: nextIds, activeId: null };
  }

  const nextActive = nextIds[Math.min(index, nextIds.length - 1)] ?? null;
  return { openTabIds: nextIds, activeId: nextActive };
}

export const LEAD_THREAD_TABS_STORAGE_KEY = "portalLeadThreadTabs";

export interface LeadThreadTabsState {
  openTabIds: string[];
  activeId: string | null;
}

const emptyTabsState: LeadThreadTabsState = {
  openTabIds: [],
  activeId: null,
};

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

/** Parses persisted tab state from a raw localStorage string. */
export function parseLeadThreadTabs(raw: string | null): LeadThreadTabsState {
  if (!raw) return emptyTabsState;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return emptyTabsState;
    const record = data as Record<string, unknown>;
    if (!isStringArray(record.openTabIds)) return emptyTabsState;
    if (record.activeId !== null && typeof record.activeId !== "string") {
      return emptyTabsState;
    }
    return {
      openTabIds: record.openTabIds,
      activeId: record.activeId,
    };
  } catch {
    return emptyTabsState;
  }
}

export function serializeLeadThreadTabs(state: LeadThreadTabsState): string {
  return JSON.stringify(state);
}

export function loadLeadThreadTabs(): LeadThreadTabsState {
  if (typeof window === "undefined") return emptyTabsState;
  try {
    return parseLeadThreadTabs(
      localStorage.getItem(LEAD_THREAD_TABS_STORAGE_KEY),
    );
  } catch {
    return emptyTabsState;
  }
}

export function saveLeadThreadTabs(state: LeadThreadTabsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      LEAD_THREAD_TABS_STORAGE_KEY,
      serializeLeadThreadTabs(state),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}
