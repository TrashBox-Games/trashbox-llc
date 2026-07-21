import { fetchAuthSession } from "aws-amplify/auth";
import { apiUrl } from "./amplify";

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_TAGS = [
  "website_quote",
  "support",
  "sales",
  "vip",
] as const;

export type LeadTag = (typeof LEAD_TAGS)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

/** Tailwind classes for the status indicator dot (fill + glow). */
export const LEAD_STATUS_DOT_CLASS: Record<LeadStatus, string> = {
  new: "bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.65)]",
  contacted: "bg-[#7EB6D4] shadow-[0_0_8px_2px_rgba(126,182,212,0.65)]",
  qualified: "bg-[#D4B87E] shadow-[0_0_8px_2px_rgba(212,184,126,0.65)]",
  won: "bg-[#8FCB8F] shadow-[0_0_8px_2px_rgba(143,203,143,0.65)]",
  lost: "bg-error shadow-[0_0_8px_2px_rgba(255,180,171,0.65)]",
};

export const LEAD_TAG_LABELS: Record<LeadTag, string> = {
  website_quote: "Website Quote",
  support: "Support",
  sales: "Sales",
  vip: "VIP",
};

export type TeamRole = "owner" | "admin" | "member";

export interface SubmissionNote {
  id: string;
  body: string;
  authorEmail: string;
  createdAt: string;
}

export interface Submission {
  clientId: string;
  submissionId: string;
  senderName: string;
  senderEmail: string;
  message: string;
  metadata?: Record<string, string>;
  submittedAt: string;
  status?: LeadStatus;
  tags?: LeadTag[];
  notes?: SubmissionNote[];
  assignedTo?: string | null;
  updatedAt?: string;
  /** Email replies on the thread (excludes the original form submission). */
  messageCount?: number;
}

export interface SubmissionsListResponse {
  clientId: string;
  clientName: string;
  items: Submission[];
  nextCursor?: string;
}

export interface AccountResponse {
  linked: boolean;
  email?: string;
  clientId?: string;
  clientName?: string;
  role?: TeamRole;
  tier?: "basic" | "premium";
  active?: boolean;
  hasBilling?: boolean;
  hasApiKey?: boolean;
  emailsUsed?: number;
  emailLimit?: number;
  usageMonth?: string;
  memberLimit?: number;
  memberCount?: number;
}

export interface ApiKeyResponse {
  apiKey?: string;
  hasApiKey: boolean;
  message?: string;
}

export interface TeamMember {
  email: string;
  role: TeamRole;
  joinedAt: string;
  name?: string;
  emailNotifications: boolean;
}

export interface TeamInvite {
  email: string;
  role: TeamRole;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  name?: string;
  emailNotifications: boolean;
}

export interface TeamResponse {
  clientId: string;
  clientName: string;
  role: TeamRole;
  members: TeamMember[];
  invites: TeamInvite[];
  memberLimit: number;
  memberCount: number;
}

export interface CreateTeamInviteInput {
  email: string;
  name?: string;
  emailNotifications?: boolean;
  role?: "member" | "admin";
}

export interface UpdateTeamMemberInput {
  name?: string;
  emailNotifications?: boolean;
  role?: "member" | "admin";
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function idToken(): Promise<string> {
  const session = await fetchAuthSession({ forceRefresh: false });
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new ApiError(401, "Not signed in");

  const payload = decodeJwtPayload(token);
  if (!payloadHasEmail(payload) && session.tokens?.accessToken) {
    const access = session.tokens.accessToken.toString();
    const accessPayload = decodeJwtPayload(access);
    if (payloadHasEmail(accessPayload)) return access;
  }

  return token;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const part = token.split(".")[1];
    if (!part) return {};
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function payloadHasEmail(payload: Record<string, unknown>): boolean {
  for (const key of ["email", "cognito:username", "username", "preferred_username"]) {
    const value = payload[key];
    if (typeof value === "string" && value.includes("@")) return true;
  }
  return false;
}

async function authFetch(path: string, init?: RequestInit) {
  if (!apiUrl) throw new ApiError(500, "NEXT_PUBLIC_API_URL is not configured");
  const token = await idToken();
  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown> & {
    message?: string;
  };

  if (!res.ok) {
    throw new ApiError(res.status, data.message || `Request failed (${res.status})`);
  }

  return data;
}

export interface ListSubmissionsOptions {
  limit?: number;
  cursor?: string;
  status?: LeadStatus;
  tag?: LeadTag;
  assignedTo?: string;
  q?: string;
  clientId?: string;
}

export async function listSubmissions(
  options?: ListSubmissionsOptions,
): Promise<SubmissionsListResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.cursor) params.set("cursor", options.cursor);
  if (options?.status) params.set("status", options.status);
  if (options?.tag) params.set("tag", options.tag);
  if (options?.assignedTo) params.set("assignedTo", options.assignedTo);
  if (options?.q) params.set("q", options.q);
  if (options?.clientId) params.set("clientId", options.clientId);
  const qs = params.toString();
  return (await authFetch(
    `/submissions${qs ? `?${qs}` : ""}`,
  )) as unknown as SubmissionsListResponse;
}

export async function updateSubmission(
  submissionId: string,
  patch: {
    status?: LeadStatus;
    tags?: LeadTag[];
    assignedTo?: string | null;
  },
): Promise<Submission> {
  return (await authFetch(`/submissions/${encodeURIComponent(submissionId)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })) as unknown as Submission;
}

export async function addSubmissionNote(
  submissionId: string,
  body: string,
): Promise<Submission> {
  return (await authFetch(
    `/submissions/${encodeURIComponent(submissionId)}/notes`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  )) as unknown as Submission;
}

export async function getTeam(): Promise<TeamResponse> {
  return (await authFetch("/team")) as unknown as TeamResponse;
}

export async function createTeamInvite(
  input: CreateTeamInviteInput | string,
): Promise<{ invite: TeamInvite; message?: string }> {
  const body =
    typeof input === "string"
      ? { email: input }
      : {
          email: input.email,
          ...(input.name ? { name: input.name } : {}),
          ...(typeof input.emailNotifications === "boolean"
            ? { emailNotifications: input.emailNotifications }
            : {}),
          ...(input.role ? { role: input.role } : {}),
        };
  return (await authFetch("/team/invites", {
    method: "POST",
    body: JSON.stringify(body),
  })) as unknown as { invite: TeamInvite; message?: string };
}

export async function deleteTeamInvite(email: string): Promise<void> {
  await authFetch(`/team/invites/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

export async function acceptTeamInvite(token: string): Promise<{
  success: boolean;
  clientId?: string;
  clientName?: string;
}> {
  return (await authFetch("/team/accept", {
    method: "POST",
    body: JSON.stringify({ token }),
  })) as unknown as {
    success: boolean;
    clientId?: string;
    clientName?: string;
  };
}

export async function deleteTeamMember(email: string): Promise<void> {
  await authFetch(`/team/members/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

export async function updateTeamMember(
  email: string,
  patch: UpdateTeamMemberInput,
): Promise<{ member: TeamMember; message?: string }> {
  return (await authFetch(`/team/members/${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })) as unknown as { member: TeamMember; message?: string };
}

export async function getAccount(): Promise<AccountResponse> {
  return (await authFetch("/account")) as unknown as AccountResponse;
}

export async function provisionAccount(businessName: string): Promise<
  AccountResponse & { apiKey?: string; created?: boolean; message?: string }
> {
  return (await authFetch("/account/provision", {
    method: "POST",
    body: JSON.stringify({ businessName }),
  })) as unknown as AccountResponse & {
    apiKey?: string;
    created?: boolean;
    message?: string;
  };
}

export async function createApiKey(): Promise<ApiKeyResponse> {
  return (await authFetch("/account/api-key", {
    method: "POST",
  })) as unknown as ApiKeyResponse;
}

export async function deleteApiKey(): Promise<ApiKeyResponse> {
  return (await authFetch("/account/api-key", {
    method: "DELETE",
  })) as unknown as ApiKeyResponse;
}

export async function startCheckout(
  plan: "basic" | "premium" = "premium",
): Promise<string> {
  const data = (await authFetch("/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
  })) as { url?: string };
  if (!data.url) throw new ApiError(500, "No checkout URL returned");
  return data.url;
}

export async function openBillingPortal(): Promise<string> {
  const data = (await authFetch("/billing/portal", {
    method: "POST",
    body: "{}",
  })) as { url?: string };
  if (!data.url) throw new ApiError(500, "No billing portal URL returned");
  return data.url;
}

export function leadStatusOf(submission: Submission): LeadStatus {
  return submission.status ?? "new";
}

export function leadTagsOf(submission: Submission): LeadTag[] {
  return submission.tags ?? [];
}

export function leadNotesOf(submission: Submission): SubmissionNote[] {
  return submission.notes ?? [];
}

export type MailboxProvider = "gmail" | "microsoft";

export interface MailboxStatusResponse {
  connected: boolean;
  provider?: MailboxProvider;
  email?: string;
  connectedBy?: string;
  connectedAt?: string;
  status?: "connected" | "error" | "disconnected";
  lastSyncAt?: string;
  lastError?: string;
}

export type LeadMessageDirection = "outbound" | "inbound";

export interface LeadMessage {
  clientId: string;
  submissionId: string;
  messageId: string;
  direction: LeadMessageDirection;
  from: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  providerMessageId?: string;
  threadId?: string;
  conversationId?: string;
  sentBy?: string;
  createdAt: string;
}

export interface LeadMessagesResponse {
  submissionId: string;
  items: LeadMessage[];
}

export async function getMailbox(): Promise<MailboxStatusResponse> {
  return (await authFetch("/mailbox")) as unknown as MailboxStatusResponse;
}

export async function connectMailbox(
  provider: MailboxProvider,
): Promise<{ authUrl: string; provider: MailboxProvider }> {
  return (await authFetch("/mailbox/connect", {
    method: "POST",
    body: JSON.stringify({ provider }),
  })) as unknown as { authUrl: string; provider: MailboxProvider };
}

export async function disconnectMailbox(): Promise<void> {
  await authFetch("/mailbox", { method: "DELETE" });
}

export async function syncMailbox(): Promise<{
  success: boolean;
  clientId: string;
  imported: number;
  error?: string;
}> {
  return (await authFetch("/mailbox/sync", {
    method: "POST",
    body: "{}",
  })) as unknown as {
    success: boolean;
    clientId: string;
    imported: number;
    error?: string;
  };
}

export async function listLeadMessages(
  submissionId: string,
): Promise<LeadMessagesResponse> {
  return (await authFetch(
    `/submissions/${encodeURIComponent(submissionId)}/messages`,
  )) as unknown as LeadMessagesResponse;
}

export async function sendLeadMessage(
  submissionId: string,
  input: { body: string; bodyHtml?: string; subject?: string },
): Promise<LeadMessage> {
  return (await authFetch(
    `/submissions/${encodeURIComponent(submissionId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )) as unknown as LeadMessage;
}
