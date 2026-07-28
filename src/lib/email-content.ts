/**
 * Merge-field rendering and input helpers for the email content library
 * (templates, signatures, snippets).
 *
 * The token catalog and the length limits mirror
 * `packages/core/src/email-content.ts` in the Form API. Keep the two in step —
 * the API rejects anything outside these bounds.
 */

export const EMAIL_CONTENT_LIMITS = {
  name: 80,
  subject: 200,
  bodyText: 20_000,
  bodyHtml: 100_000,
  shortcut: 32,
} as const;

export interface TemplateVariable {
  /** Literal token as it appears in a body, e.g. `{{lead.name}}`. */
  token: string;
  label: string;
  description: string;
}

export interface TemplateVariableContext {
  lead?: { name?: string; email?: string };
  business?: { name?: string };
  sender?: { name?: string; email?: string };
  /** Injected for deterministic tests; defaults to the current time. */
  now?: Date;
}

export interface ContentBody {
  bodyText: string;
  bodyHtml?: string;
}

type VariableResolver = (context: TemplateVariableContext) => string;

const VARIABLE_RESOLVERS: Record<string, VariableResolver> = {
  "lead.name": (ctx) => ctx.lead?.name?.trim() ?? "",
  "lead.first_name": (ctx) => firstWord(ctx.lead?.name),
  "lead.email": (ctx) => ctx.lead?.email?.trim() ?? "",
  "business.name": (ctx) => ctx.business?.name?.trim() ?? "",
  "sender.name": (ctx) => ctx.sender?.name?.trim() ?? "",
  "sender.email": (ctx) => ctx.sender?.email?.trim() ?? "",
  "date.today": (ctx) => formatToday(ctx.now ?? new Date()),
};

export const TEMPLATE_VARIABLES: readonly TemplateVariable[] = [
  {
    token: "{{lead.name}}",
    label: "Lead full name",
    description: "Name the lead entered on the form.",
  },
  {
    token: "{{lead.first_name}}",
    label: "Lead first name",
    description: "First word of the lead's name.",
  },
  {
    token: "{{lead.email}}",
    label: "Lead email",
    description: "Email address the lead submitted.",
  },
  {
    token: "{{business.name}}",
    label: "Business name",
    description: "Your business name on the account.",
  },
  {
    token: "{{sender.name}}",
    label: "Sender display name",
    description: "Sender Display Name selected for the reply.",
  },
  {
    token: "{{sender.email}}",
    label: "Sender email",
    description: "Address of the connected business mailbox.",
  },
  {
    token: "{{date.today}}",
    label: "Today's date",
    description: "Current date, for example July 25, 2026.",
  },
];

const TOKEN_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

function firstWord(value: string | undefined): string {
  return value?.trim().split(/\s+/)[0] ?? "";
}

function formatToday(now: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(now);
}

/**
 * Substitute supported merge fields. Unsupported tokens are left verbatim so a
 * typo stays visible instead of silently vanishing from a sent reply.
 */
export function renderTemplateVariables(
  body: string,
  context: TemplateVariableContext,
): string {
  return body.replace(TOKEN_PATTERN, (match, key: string) => {
    const resolver = VARIABLE_RESOLVERS[key];
    return resolver ? resolver(context) : match;
  });
}

/** Tokens in `body` that are not in the published catalog, deduplicated. */
export function unknownTemplateVariables(body: string): string[] {
  const unknown: string[] = [];
  const seen = new Set<string>();
  for (const match of body.matchAll(TOKEN_PATTERN)) {
    const key = match[1];
    if (!key || VARIABLE_RESOLVERS[key]) continue;
    const token = `{{${key}}}`;
    if (seen.has(token)) continue;
    seen.add(token);
    unknown.push(token);
  }
  return unknown;
}

/**
 * Coerce shortcut input into something the API will accept, dropping invalid
 * characters as they are typed rather than failing on save.
 */
export function sanitizeShortcutInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/^[-_]+/, "")
    .slice(0, EMAIL_CONTENT_LIMITS.shortcut);
}

export function plainTextToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
}

/** Rich-text body when one was saved, otherwise the escaped plain text. */
export function contentBodyToHtml(body: ContentBody): string {
  const html = body.bodyHtml?.trim();
  return html ? html : plainTextToHtml(body.bodyText);
}

/** Content with merge fields resolved, ready to drop into the composer. */
export function renderContentForInsert(
  body: ContentBody,
  context: TemplateVariableContext,
): { text: string; html: string } {
  return {
    text: renderTemplateVariables(body.bodyText, context),
    html: renderTemplateVariables(contentBodyToHtml(body), context),
  };
}

export function matchSnippetShortcut<T extends { shortcut: string }>(
  snippets: readonly T[],
  typed: string,
): T | undefined {
  const shortcut = sanitizeShortcutInput(typed.replace(/^\/+/, ""));
  if (!shortcut) return undefined;
  return snippets.find((snippet) => snippet.shortcut === shortcut);
}

/**
 * When the caret sits right after `/shortcut`, return that shortcut so the
 * composer can expand it. Returns null when the text does not end on a token.
 */
export function snippetTriggerAtEnd(textBeforeCursor: string): string | null {
  const match = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9][a-zA-Z0-9_-]{0,31})$/);
  if (!match?.[1]) return null;
  return sanitizeShortcutInput(match[1]) || null;
}

const BODY_ATTR = "data-trashbox-body";
const SIGNATURE_ATTR = "data-trashbox-signature";

/** Build a reply HTML document with swappable body and signature regions. */
export function composeReplyHtml(
  bodyHtml: string,
  signatureHtml?: string,
): string {
  const body = `<div ${BODY_ATTR}>${bodyHtml}</div>`;
  if (!signatureHtml?.trim()) return body;
  return `${body}<div ${SIGNATURE_ATTR}>${signatureHtml}</div>`;
}

function swapRegion(
  fullHtml: string,
  attr: string,
  nextInnerHtml: string,
  { appendIfMissing }: { appendIfMissing: boolean },
): string {
  const pattern = new RegExp(
    `<div\\s+${attr}\\b[^>]*>[\\s\\S]*?<\\/div>`,
    "i",
  );
  const replacement = `<div ${attr}>${nextInnerHtml}</div>`;
  if (pattern.test(fullHtml)) {
    return fullHtml.replace(pattern, replacement);
  }
  if (!appendIfMissing) {
    return `<div ${attr}>${nextInnerHtml}</div>${fullHtml}`;
  }
  return `${fullHtml}${replacement}`;
}

/** Swap or append the signature region; body content is left alone. */
export function replaceReplySignature(
  fullHtml: string,
  signatureHtml: string,
): string {
  if (!signatureHtml.trim()) {
    return fullHtml.replace(
      new RegExp(`<div\\s+${SIGNATURE_ATTR}\\b[^>]*>[\\s\\S]*?<\\/div>`, "i"),
      "",
    );
  }
  if (new RegExp(`<div\\s+${SIGNATURE_ATTR}\\b`, "i").test(fullHtml)) {
    return swapRegion(fullHtml, SIGNATURE_ATTR, signatureHtml, {
      appendIfMissing: true,
    });
  }
  if (new RegExp(`<div\\s+${BODY_ATTR}\\b`, "i").test(fullHtml)) {
    return `${fullHtml}<div ${SIGNATURE_ATTR}>${signatureHtml}</div>`;
  }
  return composeReplyHtml(fullHtml, signatureHtml);
}

/** Replace the body region while preserving any signature block. */
export function replaceReplyBody(fullHtml: string, bodyHtml: string): string {
  if (new RegExp(`<div\\s+${BODY_ATTR}\\b`, "i").test(fullHtml)) {
    return swapRegion(fullHtml, BODY_ATTR, bodyHtml, {
      appendIfMissing: false,
    });
  }
  const signatureMatch = fullHtml.match(
    new RegExp(`(<div\\s+${SIGNATURE_ATTR}\\b[^>]*>[\\s\\S]*?<\\/div>)`, "i"),
  );
  if (signatureMatch?.[1]) {
    return `<div ${BODY_ATTR}>${bodyHtml}</div>${signatureMatch[1]}`;
  }
  return composeReplyHtml(bodyHtml);
}
