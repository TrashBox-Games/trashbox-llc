import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

vi.mock("./amplify", () => ({
  apiUrl: "https://api.trashbox.io",
}));

import { fetchAuthSession } from "aws-amplify/auth";
import {
  acceptTeamInvite,
  addSubmissionNote,
  createApiKey,
  createTeamInvite,
  deleteApiKey,
  getAccount,
  getTeam,
  listSubmissions,
  updateSubmission,
} from "./api";

function sessionWithEmailToken() {
  const payload = btoa(JSON.stringify({ email: "owner@example.com" }));
  return {
    tokens: {
      idToken: {
        toString: () => `header.${payload}.sig`,
      },
    },
  };
}

describe("api key management", () => {
  beforeEach(() => {
    vi.mocked(fetchAuthSession).mockResolvedValue(
      sessionWithEmailToken() as Awaited<ReturnType<typeof fetchAuthSession>>,
    );
  });

  it("createApiKey POSTs /account/api-key and returns the issued key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          apiKey: "fapi_new_key",
          hasApiKey: true,
          message: "Save this API key now — it will not be shown again.",
        }),
      }),
    );

    const result = await createApiKey();

    expect(result.apiKey).toBe("fapi_new_key");
    expect(result.hasApiKey).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.trashbox.io/account/api-key",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("deleteApiKey DELETEs /account/api-key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          hasApiKey: false,
          message: "API key deleted",
        }),
      }),
    );

    const result = await deleteApiKey();

    expect(result.hasApiKey).toBe(false);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.trashbox.io/account/api-key",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("getAccount includes hasApiKey when present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          linked: true,
          email: "owner@example.com",
          hasApiKey: true,
          tier: "basic",
          active: true,
          role: "owner",
        }),
      }),
    );

    const account = await getAccount();

    expect(account.hasApiKey).toBe(true);
    expect(account.role).toBe("owner");
  });
});

describe("CRM submissions API", () => {
  beforeEach(() => {
    vi.mocked(fetchAuthSession).mockResolvedValue(
      sessionWithEmailToken() as Awaited<ReturnType<typeof fetchAuthSession>>,
    );
  });

  it("listSubmissions passes status, tag, q, and assignedTo filters", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          clientId: "c1",
          clientName: "Acme",
          items: [],
        }),
      }),
    );

    await listSubmissions({
      status: "contacted",
      tag: "sales",
      assignedTo: "sarah@example.com",
      q: "estimate",
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.trashbox.io/submissions?"),
      expect.any(Object),
    );
    const url = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    expect(url).toContain("status=contacted");
    expect(url).toContain("tag=sales");
    expect(url).toContain("assignedTo=sarah%40example.com");
    expect(url).toContain("q=estimate");
  });

  it("updateSubmission PATCHes status and tags", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          submissionId: "s1",
          status: "qualified",
          tags: ["vip"],
        }),
      }),
    );

    const result = await updateSubmission("s1", {
      status: "qualified",
      tags: ["vip"],
    });

    expect(result.status).toBe("qualified");
    expect(fetch).toHaveBeenCalledWith(
      "https://api.trashbox.io/submissions/s1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "qualified", tags: ["vip"] }),
      }),
    );
  });

  it("addSubmissionNote POSTs note body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          submissionId: "s1",
          notes: [
            {
              id: "n1",
              body: "Called customer July 15, requested estimate",
              authorEmail: "owner@example.com",
              createdAt: "2026-07-15T12:00:00.000Z",
            },
          ],
        }),
      }),
    );

    const result = await addSubmissionNote(
      "s1",
      "Called customer July 15, requested estimate",
    );

    expect(result.notes?.[0]?.body).toContain("requested estimate");
    expect(fetch).toHaveBeenCalledWith(
      "https://api.trashbox.io/submissions/s1/notes",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("team API", () => {
  beforeEach(() => {
    vi.mocked(fetchAuthSession).mockResolvedValue(
      sessionWithEmailToken() as Awaited<ReturnType<typeof fetchAuthSession>>,
    );
  });

  it("getTeam fetches roster", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          clientId: "c1",
          clientName: "Acme",
          role: "owner",
          members: [
            {
              email: "owner@example.com",
              role: "owner",
              joinedAt: "2026-01-01",
              emailNotifications: true,
            },
          ],
          invites: [],
          memberLimit: 5,
          memberCount: 1,
        }),
      }),
    );

    const team = await getTeam();
    expect(team.role).toBe("owner");
    expect(team.memberLimit).toBe(5);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.trashbox.io/team",
      expect.any(Object),
    );
  });

  it("createTeamInvite POSTs email and options", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          invite: {
            email: "teammate@example.com",
            role: "member",
            invitedBy: "owner@example.com",
            createdAt: "2026-07-16",
            expiresAt: "2026-07-23",
            emailNotifications: true,
            name: "Teammate",
          },
        }),
      }),
    );

    await createTeamInvite({
      email: "teammate@example.com",
      name: "Teammate",
      emailNotifications: true,
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.trashbox.io/team/invites",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "teammate@example.com",
          name: "Teammate",
          emailNotifications: true,
        }),
      }),
    );
  });

  it("updateTeamMember PATCHes member prefs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          member: {
            email: "teammate@example.com",
            role: "admin",
            joinedAt: "2026-01-01",
            emailNotifications: false,
            name: "Teammate",
          },
        }),
      }),
    );

    const { updateTeamMember } = await import("./api");
    await updateTeamMember("teammate@example.com", {
      role: "admin",
      emailNotifications: false,
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.trashbox.io/team/members/teammate%40example.com",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          role: "admin",
          emailNotifications: false,
        }),
      }),
    );
  });

  it("acceptTeamInvite POSTs token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, clientId: "c1" }),
      }),
    );

    const result = await acceptTeamInvite("abc123");
    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.trashbox.io/team/accept",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "abc123" }),
      }),
    );
  });
});
