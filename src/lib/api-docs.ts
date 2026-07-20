/**
 * In-app reference for the form submission (leads) endpoints under
 * `/submissions`. Mirrors the hand-written OpenAPI spec served at
 * `https://api.trashbox.io/docs` — keep the shapes in sync when the API changes.
 */

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface ApiParam {
  name: string;
  in: "path" | "query";
  required: boolean;
  type: string;
  description: string;
}

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  /** Template path for display, e.g. `/submissions/{submissionId}`. */
  path: string;
  /** Concrete path (with example ids/query) used in the curl sample. */
  pathExample: string;
  summary: string;
  description: string;
  parameters: ApiParam[];
  /** Pretty-printed JSON request body, when the endpoint accepts one. */
  requestBody?: string;
  responseStatus: number;
  /** Pretty-printed JSON response body example. */
  responseExample: string;
}

/** Every documented endpoint uses the owner portal Cognito JWT. */
export const SUBMISSIONS_API_AUTH =
  "Cognito JWT — send the signed-in owner's ID token as `Authorization: Bearer <token>`.";

const submissionExample = `{
  "clientId": "cl_abc123",
  "submissionId": "sub_01H8XABCDEF",
  "senderName": "John Smith",
  "senderEmail": "john@example.com",
  "message": "I'd like a quote for a spring cleanout.",
  "metadata": { "page": "/contact" },
  "submittedAt": "2026-07-20T14:05:00.000Z",
  "status": "new",
  "tags": ["website_quote"],
  "notes": [],
  "assignedTo": null,
  "updatedAt": "2026-07-20T14:05:00.000Z"
}`;

const submissionsListExample = `{
  "clientId": "cl_abc123",
  "clientName": "Acme Co",
  "items": [
    {
      "clientId": "cl_abc123",
      "submissionId": "sub_01H8XABCDEF",
      "senderName": "John Smith",
      "senderEmail": "john@example.com",
      "message": "I'd like a quote for a spring cleanout.",
      "submittedAt": "2026-07-20T14:05:00.000Z",
      "status": "new",
      "tags": ["website_quote"],
      "notes": [],
      "assignedTo": null,
      "updatedAt": "2026-07-20T14:05:00.000Z"
    }
  ],
  "nextCursor": "eyJwayI6ImNsX2FiYzEyMyJ9"
}`;

export const SUBMISSIONS_API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "list-submissions",
    method: "GET",
    path: "/submissions",
    pathExample: "/submissions?status=new&limit=50",
    summary: "List submissions",
    description:
      "Returns paginated form submissions (leads) for a client you belong to. Supports status, tag, assignee, and text-search filters.",
    parameters: [
      {
        name: "limit",
        in: "query",
        required: false,
        type: "integer (1–100)",
        description: "Page size. Defaults to 50.",
      },
      {
        name: "cursor",
        in: "query",
        required: false,
        type: "string",
        description: "Opaque pagination cursor from a previous response.",
      },
      {
        name: "status",
        in: "query",
        required: false,
        type: "new | contacted | qualified | won | lost",
        description: "Filter by lead status.",
      },
      {
        name: "tag",
        in: "query",
        required: false,
        type: "website_quote | support | sales | vip",
        description: "Filter by tag.",
      },
      {
        name: "assignedTo",
        in: "query",
        required: false,
        type: "email",
        description: "Filter by assignee email.",
      },
      {
        name: "q",
        in: "query",
        required: false,
        type: "string",
        description: "Case-insensitive search across name, email, and message.",
      },
      {
        name: "clientId",
        in: "query",
        required: false,
        type: "string",
        description: "Select which client when you belong to more than one.",
      },
    ],
    responseStatus: 200,
    responseExample: submissionsListExample,
  },
  {
    id: "update-submission",
    method: "PATCH",
    path: "/submissions/{submissionId}",
    pathExample: "/submissions/sub_01H8XABCDEF",
    summary: "Update a lead",
    description:
      "Updates a lead's status, tags, or assignee. Only the provided fields change.",
    parameters: [
      {
        name: "submissionId",
        in: "path",
        required: true,
        type: "string",
        description: "The submission to update.",
      },
    ],
    requestBody: `{
  "status": "contacted",
  "tags": ["sales", "vip"],
  "assignedTo": "rep@acme.co"
}`,
    responseStatus: 200,
    responseExample: submissionExample,
  },
  {
    id: "add-note",
    method: "POST",
    path: "/submissions/{submissionId}/notes",
    pathExample: "/submissions/sub_01H8XABCDEF/notes",
    summary: "Add a note to a lead",
    description: "Appends an internal note to a lead's timeline.",
    parameters: [
      {
        name: "submissionId",
        in: "path",
        required: true,
        type: "string",
        description: "The submission to annotate.",
      },
    ],
    requestBody: `{
  "body": "Called customer July 20, requested estimate."
}`,
    responseStatus: 200,
    responseExample: `{
  "clientId": "cl_abc123",
  "submissionId": "sub_01H8XABCDEF",
  "senderName": "John Smith",
  "senderEmail": "john@example.com",
  "message": "I'd like a quote for a spring cleanout.",
  "submittedAt": "2026-07-20T14:05:00.000Z",
  "status": "contacted",
  "tags": ["website_quote"],
  "notes": [
    {
      "id": "note_01H8XZZ",
      "body": "Called customer July 20, requested estimate.",
      "authorEmail": "owner@acme.co",
      "createdAt": "2026-07-20T16:30:00.000Z"
    }
  ],
  "assignedTo": "rep@acme.co",
  "updatedAt": "2026-07-20T16:30:00.000Z"
}`,
  },
  {
    id: "list-messages",
    method: "GET",
    path: "/submissions/{submissionId}/messages",
    pathExample: "/submissions/sub_01H8XABCDEF/messages",
    summary: "List messages on a lead",
    description:
      "Returns the email thread (inbound and outbound) associated with a lead.",
    parameters: [
      {
        name: "submissionId",
        in: "path",
        required: true,
        type: "string",
        description: "The submission whose thread to read.",
      },
    ],
    responseStatus: 200,
    responseExample: `{
  "submissionId": "sub_01H8XABCDEF",
  "items": [
    {
      "clientId": "cl_abc123",
      "submissionId": "sub_01H8XABCDEF",
      "messageId": "msg_01H8XM1",
      "direction": "outbound",
      "from": "owner@acme.co",
      "to": "john@example.com",
      "subject": "Re: Your quote request",
      "bodyText": "Thanks for reaching out — here is your quote.",
      "createdAt": "2026-07-20T15:00:00.000Z"
    }
  ]
}`,
  },
  {
    id: "send-message",
    method: "POST",
    path: "/submissions/{submissionId}/messages",
    pathExample: "/submissions/sub_01H8XABCDEF/messages",
    summary: "Send a reply",
    description:
      "Sends an email reply from the connected business mailbox. Counts against the monthly email quota.",
    parameters: [
      {
        name: "submissionId",
        in: "path",
        required: true,
        type: "string",
        description: "The submission to reply to.",
      },
    ],
    requestBody: `{
  "body": "Thanks for reaching out — here is your quote.",
  "subject": "Re: Your quote request"
}`,
    responseStatus: 201,
    responseExample: `{
  "clientId": "cl_abc123",
  "submissionId": "sub_01H8XABCDEF",
  "messageId": "msg_01H8XM2",
  "direction": "outbound",
  "from": "owner@acme.co",
  "to": "john@example.com",
  "subject": "Re: Your quote request",
  "bodyText": "Thanks for reaching out — here is your quote.",
  "createdAt": "2026-07-20T17:10:00.000Z"
}`,
  },
];

/** Builds a copy-pasteable curl example for an endpoint. */
export function buildCurlExample(
  endpoint: ApiEndpoint,
  baseUrl: string,
): string {
  const url = `${baseUrl}${endpoint.pathExample}`;
  const methodFlag = endpoint.method === "GET" ? "" : `-X ${endpoint.method} `;
  const hasBody = Boolean(endpoint.requestBody);

  const lines = [`curl ${methodFlag}"${url}" \\`];
  lines.push(`  -H "Authorization: Bearer $TOKEN"${hasBody ? " \\" : ""}`);

  if (endpoint.requestBody) {
    const compact = JSON.stringify(JSON.parse(endpoint.requestBody));
    lines.push(`  -H "Content-Type: application/json" \\`);
    lines.push(`  -d '${compact}'`);
  }

  return lines.join("\n");
}
