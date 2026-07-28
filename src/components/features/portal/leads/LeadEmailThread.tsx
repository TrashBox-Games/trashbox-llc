"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Select } from "@/components/atoms/Select";
import {
  RichTextEditor,
  type RichTextEditorHandle,
  type RichTextValue,
} from "@/components/atoms/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  EmailSignature,
  EmailSnippet,
  EmailTemplate,
  FromIdentityOption,
  LeadMessage,
} from "@/lib/api";
import {
  composeReplyHtml,
  matchSnippetShortcut,
  renderContentForInsert,
  replaceReplyBody,
  replaceReplySignature,
  snippetTriggerAtEnd,
  type TemplateVariableContext,
} from "@/lib/email-content";
import { settingsSectionPath } from "@/lib/portal-settings";
import { cn } from "@/lib/utils";

const labelClass =
  "mb-2 block font-label text-[10px] uppercase tracking-widest text-outline";

export interface LeadComposerLibrary {
  templates: EmailTemplate[];
  signatures: EmailSignature[];
  snippets: EmailSnippet[];
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDay(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

interface TimelineNodeProps {
  eyebrow: string;
  title: string;
  day: string;
  accent: "primary" | "muted";
  defaultOpen?: boolean;
  children: ReactNode;
}

function TimelineNode({
  eyebrow,
  title,
  day,
  accent,
  defaultOpen = false,
  children,
}: TimelineNodeProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className={cn(
          "ring-surface-container-low absolute top-2 -left-[25px] size-2 rounded-full ring-4",
          accent === "primary" ? "bg-primary" : "bg-secondary-fixed-dim",
        )}
      />
      <Button
        type="button"
        variant="ghost"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-auto w-full flex-col items-stretch justify-start rounded p-4 text-left font-normal tracking-normal whitespace-normal text-inherit normal-case",
          open
            ? "bg-surface-container hover:bg-surface-variant"
            : "bg-surface-container-lowest hover:bg-surface-container",
        )}
      >
        <div className="mb-1 flex items-start justify-between gap-4">
          <span className="font-label text-outline text-[9px] tracking-widest uppercase">
            {eyebrow}
          </span>
          <span className="text-outline-variant font-mono text-[9px] uppercase">
            {day}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-white">{title}</span>
          <MaterialIcon
            name="expand_more"
            className={cn(
              "text-outline text-sm transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </Button>
      {open && (
        <div className="bg-surface-container/50 text-on-surface mt-3 rounded p-4 text-sm">
          {children}
        </div>
      )}
    </li>
  );
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="font-label text-outline w-12 shrink-0 text-[10px] uppercase">
        {label}
      </span>
      <span className="text-on-surface min-w-0">{value}</span>
    </div>
  );
}

/** Rough plain-text length of the body region (ignores the signature). */
function bodyTextLength(html: string): number {
  const match = html.match(
    /<div\s+data-trashbox-body\b[^>]*>([\s\S]*?)<\/div>/i,
  );
  const source =
    match?.[1] ??
    html.replace(/<div\s+data-trashbox-signature\b[^>]*>[\s\S]*?<\/div>/i, "");
  return source
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

function defaultSignatureId(signatures: EmailSignature[]): string {
  return (
    signatures.find((signature) => signature.isDefault)?.id ??
    signatures[0]?.id ??
    ""
  );
}

function buildSeedHtml(
  signatures: EmailSignature[],
  signatureId: string,
  context: TemplateVariableContext,
): string {
  const signature = signatures.find((item) => item.id === signatureId);
  const signatureHtml = signature
    ? renderContentForInsert(signature, context).html
    : undefined;
  return composeReplyHtml("<p><br></p>", signatureHtml);
}

export interface LeadEmailThreadProps {
  formMessage: string;
  formFrom: string;
  formAt: string;
  messages: LeadMessage[];
  mailboxConnected: boolean;
  fromAddress?: string;
  fromOptions?: FromIdentityOption[];
  busy?: boolean;
  error?: string | null;
  /** Account email content library used while composing. */
  library?: LeadComposerLibrary;
  /** Values used to resolve merge fields on insert. */
  variableContext?: TemplateVariableContext;
  onSend: (
    text: string,
    html?: string,
    from?: { fromIdentityId?: string },
  ) => Promise<void>;
}

export function LeadEmailThread({
  formMessage,
  formFrom,
  formAt,
  messages,
  mailboxConnected,
  fromAddress,
  fromOptions = [],
  busy = false,
  error,
  library,
  variableContext = {},
  onSend,
}: LeadEmailThreadProps) {
  const templates = library?.templates ?? [];
  const signatures = library?.signatures ?? [];
  const snippets = library?.snippets ?? [];

  const defaultOption =
    fromOptions.find((option) => option.label.includes("(Default)")) ??
    fromOptions[0];
  const [fromIdentityId, setFromIdentityId] = useState(defaultOption?.id ?? "");
  const selected = fromOptions.find((o) => o.id === fromIdentityId);
  const resolvedPreview = selected?.displayName || selected?.label || "";
  const hasFromOptions = fromOptions.length > 0;

  const context = useMemo<TemplateVariableContext>(
    () => ({
      ...variableContext,
      sender: {
        name: selected?.displayName || variableContext.sender?.name,
        email: fromAddress || variableContext.sender?.email,
      },
    }),
    [variableContext, selected?.displayName, fromAddress],
  );

  const [signatureId, setSignatureId] = useState(() =>
    defaultSignatureId(signatures),
  );
  const [editorKey, setEditorKey] = useState(0);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const seededForSignature = useRef<string | null>(null);
  const draftRef = useRef<RichTextValue>({ html: "", text: "" });

  const seedHtml = useMemo(
    () => buildSeedHtml(signatures, signatureId, context),
    [signatures, signatureId, context],
  );

  const [draft, setDraft] = useState<RichTextValue>(() => ({
    html: seedHtml,
    text: "",
  }));
  draftRef.current = draft;

  // Seed once when the default signature first becomes available.
  useEffect(() => {
    if (!mailboxConnected) return;
    const nextDefault = defaultSignatureId(signatures);
    if (!nextDefault) return;
    if (seededForSignature.current === nextDefault) return;
    if (bodyTextLength(draftRef.current.html) > 0) return;

    seededForSignature.current = nextDefault;
    setSignatureId(nextDefault);
    const html = buildSeedHtml(signatures, nextDefault, context);
    setDraft({ html, text: "" });
    setEditorKey((key) => key + 1);
  }, [mailboxConnected, signatures, context]);

  // Refresh merge fields inside the signature when the From identity changes.
  useEffect(() => {
    if (!signatureId || !editorRef.current) return;
    const signature = signatures.find((item) => item.id === signatureId);
    if (!signature) return;
    const current = draftRef.current.html;
    const nextHtml = replaceReplySignature(
      current,
      renderContentForInsert(signature, context).html,
    );
    if (nextHtml === current) return;
    editorRef.current.setHtml(nextHtml);
  }, [
    fromIdentityId,
    context.sender?.name,
    context.sender?.email,
    signatureId,
    signatures,
    context,
  ]);

  const hasContent = bodyTextLength(draft.html) > 0;

  async function submit() {
    if (!hasContent || busy || !fromIdentityId) return;
    const html = draft.html.trim();
    await onSend(draft.text, html ? html : undefined, {
      fromIdentityId,
    });
    const htmlSeed = buildSeedHtml(signatures, signatureId, context);
    setDraft({ html: htmlSeed, text: "" });
    setEditorKey((key) => key + 1);
  }

  function applyTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    if (!template || !editorRef.current) return;
    const rendered = renderContentForInsert(template, context);
    const next = replaceReplyBody(
      draftRef.current.html || seedHtml,
      rendered.html,
    );
    editorRef.current.setHtml(next);
  }

  function applySignature(nextId: string) {
    setSignatureId(nextId);
    const signature = signatures.find((item) => item.id === nextId);
    if (!editorRef.current) return;
    const signatureHtml = signature
      ? renderContentForInsert(signature, context).html
      : "";
    editorRef.current.setHtml(
      replaceReplySignature(draftRef.current.html || seedHtml, signatureHtml),
    );
  }

  function applySnippet(snippetId: string) {
    const snippet = snippets.find((item) => item.id === snippetId);
    if (!snippet || !editorRef.current) return;
    const rendered = renderContentForInsert(snippet, context);
    editorRef.current.insertHtml(rendered.html);
  }

  function expandSnippetShortcut(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== " " && event.key !== "Enter") return false;
    if (event.metaKey || event.ctrlKey || event.altKey) return false;

    const before = editorRef.current?.textBeforeCursor() ?? "";
    const trigger = snippetTriggerAtEnd(before);
    if (!trigger) return false;

    const snippet = matchSnippetShortcut(snippets, trigger);
    if (!snippet || !editorRef.current) return false;

    event.preventDefault();
    const rendered = renderContentForInsert(snippet, context);
    const tokenLength = trigger.length + 1; // leading "/"
    const suffix = event.key === " " ? " " : "<br />";
    editorRef.current.replaceCharsBeforeCursor(
      tokenLength,
      `${rendered.html}${suffix}`,
    );
    return true;
  }

  function onEditorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void submit();
      return;
    }
    expandSnippetShortcut(event);
  }

  const sendDisabled = busy || !hasContent || !fromIdentityId;
  const libraryEmpty =
    templates.length === 0 && signatures.length === 0 && snippets.length === 0;

  return (
    <div className="border-outline-variant/10 mt-10 border-t pt-6">
      <p className={labelClass}>Email thread</p>

      <ol className="border-outline-variant/20 relative ml-1 space-y-4 border-l pl-6">
        <TimelineNode
          eyebrow={`Form submission · ${formFrom}`}
          title={formMessage.split("\n")[0] || "Form submission"}
          day={formatDay(formAt)}
          accent="primary"
          defaultOpen
        >
          <div className="space-y-4">
            <div className="border-outline-variant/10 grid gap-2 border-b pb-4">
              <MetaRow label="From" value={formFrom} />
              <MetaRow label="Date" value={formatWhen(formAt)} />
            </div>
            <p className="text-on-surface leading-relaxed whitespace-pre-wrap">
              {formMessage}
            </p>
          </div>
        </TimelineNode>

        {messages.map((message) => {
          const outbound = message.direction === "outbound";
          return (
            <TimelineNode
              key={message.messageId}
              eyebrow={`${outbound ? "Sent" : "Received"} · ${message.from}${
                message.sentBy ? ` · ${message.sentBy}` : ""
              }`}
              title={
                message.subject || (outbound ? "Reply sent" : "Reply received")
              }
              day={formatDay(message.createdAt)}
              accent={outbound ? "primary" : "muted"}
            >
              <div className="space-y-4">
                <div className="border-outline-variant/10 grid gap-1 border-b pb-3">
                  <MetaRow label="From" value={message.from} />
                  <MetaRow label="To" value={message.to} />
                  <MetaRow label="Date" value={formatWhen(message.createdAt)} />
                </div>
                <p className="text-on-surface leading-relaxed whitespace-pre-wrap">
                  {message.bodyText}
                </p>
              </div>
            </TimelineNode>
          );
        })}
      </ol>

      {error && <p className="text-error mt-4 text-sm">{error}</p>}

      {mailboxConnected ? (
        <div className="border-outline-variant/10 bg-surface-container-low mt-8 overflow-hidden rounded-lg border shadow-md">
          <div className="bg-surface-container-lowest/50 space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-label text-outline w-8 shrink-0 text-[10px] uppercase">
                To
              </span>
              <span className="bg-surface-container inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-white shadow-sm">
                {formFrom}
              </span>
              <span className="font-label text-outline w-10 shrink-0 text-[10px] uppercase">
                From
              </span>
              <div className="min-w-[12rem] flex-1">
                {hasFromOptions ? (
                  <Select
                    aria-label="Sender Display Name"
                    value={fromIdentityId}
                    onChange={setFromIdentityId}
                    disabled={busy}
                    options={fromOptions.map((option) => ({
                      value: option.id,
                      label: option.label,
                    }))}
                  />
                ) : (
                  <p className="text-on-surface-variant py-2 text-sm">
                    No Sender Display Name assigned. Ask an owner or admin to
                    set one in Members.
                  </p>
                )}
              </div>
            </div>
          </div>

          <RichTextEditor
            key={editorKey}
            ref={editorRef}
            ariaLabel="Reply"
            placeholder="Type your reply here… Use /shortcut for snippets."
            disabled={busy}
            initialHtml={draft.html}
            onChange={setDraft}
            onKeyDown={onEditorKeyDown}
            className="rounded-none border-0 bg-transparent"
            toolbarStart={
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Template"
                      title="Templates"
                      disabled={busy || templates.length === 0}
                      className="h-8 gap-0.5 rounded px-1.5 font-body text-xs font-normal normal-case tracking-normal text-outline hover:bg-surface-variant hover:text-white"
                    >
                      <MaterialIcon name="description" className="text-lg" />
                      <MaterialIcon
                        name="arrow_drop_down"
                        className="text-base opacity-70"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="z-[100] max-h-64 border-outline-variant/20 bg-surface-container-high text-on-surface"
                  >
                    {templates.map((template) => (
                      <DropdownMenuItem
                        key={template.id}
                        onSelect={() => applyTemplate(template.id)}
                      >
                        {template.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Snippet"
                      title="Snippets"
                      disabled={busy || snippets.length === 0}
                      className="h-8 gap-0.5 rounded px-1.5 font-body text-xs font-normal normal-case tracking-normal text-outline hover:bg-surface-variant hover:text-white"
                    >
                      <MaterialIcon name="data_object" className="text-lg" />
                      <MaterialIcon
                        name="arrow_drop_down"
                        className="text-base opacity-70"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="z-[100] max-h-64 border-outline-variant/20 bg-surface-container-high text-on-surface"
                  >
                    {snippets.map((snippet) => (
                      <DropdownMenuItem
                        key={snippet.id}
                        onSelect={() => applySnippet(snippet.id)}
                      >
                        {snippet.shortcut
                          ? `${snippet.name} (/${snippet.shortcut})`
                          : snippet.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Signature"
                      title="Signatures"
                      disabled={busy || signatures.length === 0}
                      className="h-8 gap-0.5 rounded px-1.5 font-body text-xs font-normal normal-case tracking-normal text-outline hover:bg-surface-variant hover:text-white"
                    >
                      <MaterialIcon name="draw" className="text-lg" />
                      <MaterialIcon
                        name="arrow_drop_down"
                        className="text-base opacity-70"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="z-[100] max-h-64 border-outline-variant/20 bg-surface-container-high text-on-surface"
                  >
                    {signatures.map((signature) => (
                      <DropdownMenuItem
                        key={signature.id}
                        onSelect={() => applySignature(signature.id)}
                      >
                        {signature.isDefault
                          ? `${signature.name} (Default)`
                          : signature.name}
                        {signature.id === signatureId ? " ✓" : ""}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            }
            toolbarEnd={
              libraryEmpty ? (
                <a
                  href={settingsSectionPath("templates")}
                  className="font-label ml-1 text-[10px] tracking-widest text-white uppercase underline"
                >
                  Manage in Settings
                </a>
              ) : null
            }
          />

          <div className="bg-surface-container/80 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              {fromAddress && (
                <span className="font-label text-outline-variant text-[10px] uppercase">
                  Replying as{" "}
                  <span className="font-medium text-white">
                    {resolvedPreview
                      ? `${resolvedPreview} <${fromAddress}>`
                      : fromAddress}
                  </span>
                </span>
              )}
              <span className="text-outline-variant/60 font-mono text-[10px]">
                Cmd + Enter to send
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={sendDisabled}
              onClick={() => void submit()}
              className="rounded bg-white font-label font-medium text-background shadow-sm hover:bg-white/90 hover:text-background"
            >
              Send message
              <MaterialIcon name="send" className="text-sm" />
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-on-surface-variant mt-6 text-sm">
          Connect a business mailbox in{" "}
          <a
            href={settingsSectionPath("email-accounts")}
            className="text-white underline"
          >
            Settings
          </a>{" "}
          to reply from the portal.
        </p>
      )}
    </div>
  );
}
