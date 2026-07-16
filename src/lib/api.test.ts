import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

vi.mock("./amplify", () => ({
  apiUrl: "https://api.trashbox.io",
}));

import { fetchAuthSession } from "aws-amplify/auth";
import {
  createApiKey,
  deleteApiKey,
  getAccount,
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
        }),
      }),
    );

    const account = await getAccount();

    expect(account.hasApiKey).toBe(true);
  });
});
