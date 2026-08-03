const ORG_KEY = "portalSelectedOrgId";
const ORG_NAME_KEY = "portalSelectedOrgName";
const PROJECT_KEY = "portalSelectedProjectId";

export function getSelectedOrgId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ORG_KEY) || localStorage.getItem(ORG_KEY);
}

export function getSelectedOrgName(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem(ORG_NAME_KEY) || localStorage.getItem(ORG_NAME_KEY)
  );
}

export function getSelectedProjectId(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem(PROJECT_KEY) || localStorage.getItem(PROJECT_KEY)
  );
}

export function setSelectedWorkspace(
  orgId: string | null,
  projectId: string | null,
  orgName?: string | null,
): void {
  if (typeof window === "undefined") return;
  const previousOrgId = getSelectedOrgId();
  if (orgId) {
    localStorage.setItem(ORG_KEY, orgId);
    sessionStorage.setItem(ORG_KEY, orgId);
    const trimmedName = orgName?.trim();
    if (trimmedName) {
      localStorage.setItem(ORG_NAME_KEY, trimmedName);
      sessionStorage.setItem(ORG_NAME_KEY, trimmedName);
    } else if (previousOrgId !== orgId) {
      localStorage.removeItem(ORG_NAME_KEY);
      sessionStorage.removeItem(ORG_NAME_KEY);
    }
  } else {
    localStorage.removeItem(ORG_KEY);
    sessionStorage.removeItem(ORG_KEY);
    localStorage.removeItem(ORG_NAME_KEY);
    sessionStorage.removeItem(ORG_NAME_KEY);
  }
  if (projectId) {
    localStorage.setItem(PROJECT_KEY, projectId);
    sessionStorage.setItem(PROJECT_KEY, projectId);
  } else {
    localStorage.removeItem(PROJECT_KEY);
    sessionStorage.removeItem(PROJECT_KEY);
  }
}
