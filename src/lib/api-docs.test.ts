import { describe, expect, it } from "vitest";
import {
  SUBMISSIONS_API_ENDPOINTS,
  buildCurlExample,
  type ApiEndpoint,
} from "./api-docs";

const baseUrl = "https://api.trashbox.io";

describe("SUBMISSIONS_API_ENDPOINTS", () => {
  it("only documents endpoints under /submissions", () => {
    expect(SUBMISSIONS_API_ENDPOINTS.length).toBeGreaterThan(0);
    for (const endpoint of SUBMISSIONS_API_ENDPOINTS) {
      expect(endpoint.path.startsWith("/submissions")).toBe(true);
    }
  });

  it("covers the list endpoint", () => {
    const list = SUBMISSIONS_API_ENDPOINTS.find(
      (e) => e.method === "GET" && e.path === "/submissions",
    );
    expect(list).toBeDefined();
  });

  it("provides valid JSON response examples", () => {
    for (const endpoint of SUBMISSIONS_API_ENDPOINTS) {
      expect(() => JSON.parse(endpoint.responseExample)).not.toThrow();
      if (endpoint.requestBody) {
        expect(() => JSON.parse(endpoint.requestBody as string)).not.toThrow();
      }
    }
  });
});

describe("buildCurlExample", () => {
  const getEndpoint: ApiEndpoint = {
    id: "list",
    method: "GET",
    path: "/submissions",
    pathExample: "/submissions?status=new",
    summary: "List",
    description: "",
    parameters: [],
    responseStatus: 200,
    responseExample: "{}",
  };

  const patchEndpoint: ApiEndpoint = {
    id: "update",
    method: "PATCH",
    path: "/submissions/{submissionId}",
    pathExample: "/submissions/sub_123",
    summary: "Update",
    description: "",
    parameters: [],
    requestBody: '{\n  "status": "contacted"\n}',
    responseStatus: 200,
    responseExample: "{}",
  };

  it("builds a bearer-authed GET curl without a body", () => {
    const curl = buildCurlExample(getEndpoint, baseUrl);
    expect(curl).toContain(
      'curl "https://api.trashbox.io/submissions?status=new"',
    );
    expect(curl).toContain('-H "Authorization: Bearer $TOKEN"');
    expect(curl).not.toContain("-d ");
  });

  it("builds a curl with method flag, content-type, and compact body", () => {
    const curl = buildCurlExample(patchEndpoint, baseUrl);
    expect(curl).toContain('curl -X PATCH "https://api.trashbox.io/submissions/sub_123"');
    expect(curl).toContain('-H "Content-Type: application/json"');
    expect(curl).toContain(`-d '{"status":"contacted"}'`);
  });
});
