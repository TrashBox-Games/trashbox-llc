"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import {
  EmailTemplateBuilder,
  type EmailTemplateBuilderSavePayload,
} from "@/components/features/portal/settings/template-builder/EmailTemplateBuilder";
import { ApiError, createEmailTemplate } from "@/lib/api";
import {
  documentFromStarter,
  emptyDocument,
  type EmailTemplateDocument,
} from "@/lib/email-template-document";
import { getStarterById } from "@/lib/email-template-starters";
import { portalNavigate } from "@/lib/portal-routes";
import {
  TEMPLATE_BUILDER_DRAFT_STORAGE_KEY,
  settingsSectionPath,
  templateBuilderNewPath,
  type TemplateBuilderDraftPayload,
} from "@/lib/portal-settings";

function readDraft(): TemplateBuilderDraftPayload | null {
  try {
    const raw = sessionStorage.getItem(TEMPLATE_BUILDER_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(TEMPLATE_BUILDER_DRAFT_STORAGE_KEY);
    return JSON.parse(raw) as TemplateBuilderDraftPayload;
  } catch {
    return null;
  }
}

function resolveInitial(starterId: string, useDraft: boolean): {
  name: string;
  subject: string;
  document: EmailTemplateDocument;
} {
  if (useDraft && typeof window !== "undefined") {
    const draft = readDraft();
    if (draft?.document && typeof draft.document === "object") {
      return {
        name: draft.name ?? "",
        subject: draft.subject ?? "",
        document: draft.document as EmailTemplateDocument,
      };
    }
  }
  if (starterId) {
    const starter = getStarterById(starterId);
    if (starter) {
      return {
        name: starter.name === "Blank" ? "" : starter.name,
        subject: starter.subject ?? "",
        document: documentFromStarter(starter),
      };
    }
  }
  return { name: "", subject: "", document: emptyDocument() };
}

function TemplateBuilderCreateInner(): React.ReactElement {
  const searchParams = useSearchParams();
  const starterId = searchParams.get("starter")?.trim() ?? "";
  const useDraft = searchParams.get("draft") === "1";

  const [initial] = useState(() => resolveInitial(starterId, useDraft));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goList() {
    portalNavigate(settingsSectionPath("templates"));
  }

  function goGallery() {
    portalNavigate(templateBuilderNewPath());
  }

  async function onSave(payload: EmailTemplateBuilderSavePayload) {
    setBusy(true);
    setError(null);
    try {
      await createEmailTemplate({
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

  return (
    <EmailTemplateBuilder
      key={`${starterId}-${useDraft ? "draft" : "starter"}`}
      initialName={initial.name}
      initialSubject={initial.subject}
      initialDocument={initial.document}
      busy={busy}
      error={error}
      onSave={onSave}
      onCancel={starterId || useDraft ? goGallery : goList}
      className="h-full min-h-0 border-0"
    />
  );
}

export function TemplateBuilderCreatePage(): React.ReactElement {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <TemplateBuilderCreateInner />
    </Suspense>
  );
}
