"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import {
  EmailContentSettings,
  type EmailContentDraft,
  type EmailContentEntry,
  type EmailContentKind,
} from "@/components/features/portal/settings/EmailContentSettings";
import {
  ApiError,
  createEmailSignature,
  createEmailSnippet,
  createEmailTemplate,
  deleteEmailSignature,
  deleteEmailSnippet,
  deleteEmailTemplate,
  listEmailSignatures,
  listEmailSnippets,
  listEmailTemplates,
  updateEmailSignature,
  updateEmailSnippet,
  updateEmailTemplate,
  type EmailContentListResponse,
} from "@/lib/api";

export interface EmailContentSectionInitialState {
  items: EmailContentEntry[];
  canManage: boolean;
}

export interface EmailContentSettingsSectionProps {
  kind: EmailContentKind;
  /** Used to resolve `{{business.name}}` in previews. */
  businessName?: string;
  /** When set, skip network load (Storybook/Chromatic demos). */
  initialState?: EmailContentSectionInitialState;
}

interface KindApi {
  list: () => Promise<EmailContentListResponse<EmailContentEntry>>;
  create: (draft: EmailContentDraft) => Promise<unknown>;
  update: (id: string, draft: EmailContentDraft) => Promise<unknown>;
  remove: (id: string) => Promise<void>;
  /** Signatures only; other kinds have no account-wide default. */
  makeDefault?: (id: string) => Promise<unknown>;
}

/** Blank rich text is stored as absent rather than an empty string. */
function html(draft: EmailContentDraft): string | null {
  return draft.bodyHtml.trim() ? draft.bodyHtml : null;
}

const KIND_API: Record<EmailContentKind, KindApi> = {
  template: {
    list: listEmailTemplates,
    create: (draft) =>
      createEmailTemplate({
        name: draft.name,
        subject: draft.subject,
        bodyText: draft.bodyText,
        bodyHtml: html(draft),
      }),
    update: (id, draft) =>
      updateEmailTemplate(id, {
        name: draft.name,
        subject: draft.subject,
        bodyText: draft.bodyText,
        bodyHtml: html(draft),
      }),
    remove: deleteEmailTemplate,
  },
  signature: {
    list: listEmailSignatures,
    create: (draft) =>
      createEmailSignature({
        name: draft.name,
        bodyText: draft.bodyText,
        bodyHtml: html(draft),
        isDefault: draft.isDefault,
      }),
    update: (id, draft) =>
      updateEmailSignature(id, {
        name: draft.name,
        bodyText: draft.bodyText,
        bodyHtml: html(draft),
        isDefault: draft.isDefault,
      }),
    remove: deleteEmailSignature,
    makeDefault: (id) => updateEmailSignature(id, { isDefault: true }),
  },
  snippet: {
    list: listEmailSnippets,
    create: (draft) =>
      createEmailSnippet({
        name: draft.name,
        shortcut: draft.shortcut || null,
        bodyText: draft.bodyText,
        bodyHtml: html(draft),
      }),
    update: (id, draft) =>
      updateEmailSnippet(id, {
        name: draft.name,
        shortcut: draft.shortcut || null,
        bodyText: draft.bodyText,
        bodyHtml: html(draft),
      }),
    remove: deleteEmailSnippet,
  },
};

const KIND_LABEL: Record<EmailContentKind, string> = {
  template: "Template",
  signature: "Signature",
  snippet: "Snippet",
};

export function EmailContentSettingsSection({
  kind,
  businessName,
  initialState,
}: EmailContentSettingsSectionProps) {
  const api = KIND_API[kind];
  const [items, setItems] = useState<EmailContentEntry[]>(
    initialState?.items ?? [],
  );
  const [canManage, setCanManage] = useState(initialState?.canManage ?? false);
  const [ready, setReady] = useState(Boolean(initialState));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await api.list();
    setItems(response.items);
    setCanManage(response.canManage);
  }, [api]);

  useEffect(() => {
    if (initialState) return;

    let cancelled = false;
    async function loadOnce() {
      setReady(false);
      setError(null);
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : `Failed to load ${kind}s`,
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void loadOnce();
    return () => {
      cancelled = true;
    };
  }, [load, initialState, kind]);

  /**
   * Mutations reload the list rather than patching state locally: promoting a
   * default signature also clears the flag on its siblings server-side.
   */
  const mutate = useCallback(
    async (action: () => Promise<unknown>, successNotice: string) => {
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        await action();
        await load();
        setNotice(successNotice);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : `Could not update ${kind}s`,
        );
      } finally {
        setBusy(false);
      }
    },
    [load, kind],
  );

  const label = KIND_LABEL[kind];

  if (!ready) {
    return <PortalSkeleton variant="settings" />;
  }

  return (
    <EmailContentSettings
      kind={kind}
      items={items}
      canManage={canManage}
      busy={busy}
      error={error}
      notice={notice}
      previewContext={businessName ? { business: { name: businessName } } : undefined}
      onCreate={(draft) =>
        mutate(() => api.create(draft), `${label} saved.`)
      }
      onUpdate={(id, draft) =>
        mutate(() => api.update(id, draft), `${label} saved.`)
      }
      onDelete={(id) => mutate(() => api.remove(id), `${label} deleted.`)}
      onMakeDefault={
        api.makeDefault
          ? (id) =>
              mutate(
                () => api.makeDefault!(id),
                "Default signature updated.",
              )
          : undefined
      }
    />
  );
}
