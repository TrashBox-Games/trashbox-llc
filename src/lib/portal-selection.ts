const ORG_KEY = "portalSelectedOrgId";
const PROJECT_KEY = "portalSelectedProjectId";

export function getSelectedOrgId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ORG_KEY) || localStorage.getItem(ORG_KEY);
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
): void {
  if (typeof window === "undefined") return;
  if (orgId) {
    localStorage.setItem(ORG_KEY, orgId);
    sessionStorage.setItem(ORG_KEY, orgId);
  } else {
    localStorage.removeItem(ORG_KEY);
    sessionStorage.removeItem(ORG_KEY);
  }
  if (projectId) {
    localStorage.setItem(PROJECT_KEY, projectId);
    sessionStorage.setItem(PROJECT_KEY, projectId);
  } else {
    localStorage.removeItem(PROJECT_KEY);
    sessionStorage.removeItem(PROJECT_KEY);
  }
}
