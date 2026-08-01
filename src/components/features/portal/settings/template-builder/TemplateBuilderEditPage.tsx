"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import {
  EmailTemplateBuilder,
  type EmailTemplateBuilderSavePayload,
} from "@/components/features/portal/settings/template-builder/EmailTemplateBuilder";
import { ApiError, listEmailTemplates, updateEmailTemplate } from "@/lib/api";
import {
  emptyDocument,
  parseDocumentFromHtml,
  type EmailTemplateDocument,
} from "@/lib/email-template-document";
import { portalNavigate } from "@/lib/portal-routes";
import { settingsSectionPath } from "@/lib/portal-settings";

function TemplateBuilderEditInner(): React.ReactElement {
  const searchParams = useSearchParams();
  const id = searchParams.get("id")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [document, setDocument] = useState<EmailTemplateDocument>(emptyDocument);

  function goList() {
    portalNavigate(settingsSectionPath("templates"));
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) {
        setError("Missing template id.");
        setLoading(false);
        return;
      }
      try {
        const { items } = await listEmailTemplates();
        const item = items.find((template) => template.id === id);
        if (!item) {
          if (!cancelled) {
            setError("Template not found.");
            setLoading(false);
          }
          return;
        }
        if (cancelled) return;
        setName(item.name);
        setSubject(item.subject);
        setDocument(
          parseDocumentFromHtml(item.bodyHtml?.trim() || item.bodyText || ""),
        );
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not load template";
        setError(message);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onSave(payload: EmailTemplateBuilderSavePayload) {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      await updateEmailTemplate(id, {
        name: payload.name,
        subject: payload.subject,
        bodyText: payload.bodyText,
        bodyHtml: payload.bodyHtml,
      });
      goList();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not save template";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <PortalSkeleton />;

  if (error && !name) {
    return (
      <div className="border border-error/40 bg-error/10 p-6 text-sm text-error">
        <p>{error}</p>
        <button
          type="button"
          className="mt-4 text-white underline"
          onClick={goList}
        >
          Back to templates
        </button>
      </div>
    );
  }

  return (
    <EmailTemplateBuilder
      key={id}
      initialName={name}
      initialSubject={subject}
      initialDocument={document}
      busy={busy}
      error={error}
      onSave={onSave}
      onCancel={goList}
      className="h-full min-h-0 border-0"
    />
  );
}

export function TemplateBuilderEditPage(): React.ReactElement {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <TemplateBuilderEditInner />
    </Suspense>
  );
}
