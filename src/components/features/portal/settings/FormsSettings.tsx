"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FadeIn } from "@/components/atoms/FadeIn";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { PortalLink } from "@/components/features/portal/PortalLink";
import { PortalSkeleton } from "@/components/features/portal/PortalSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import {
  ApiError,
  createForm,
  listForms,
  updateForm,
  type ProjectForm,
} from "@/lib/api";
import { usePortal } from "@/lib/portal";
import {
  portalNavigate,
  portalWorkspacePath,
} from "@/lib/portal-routes";
import { cn } from "@/lib/utils";

export type FormsSettingsInitialState = {
  forms: ProjectForm[];
  canManage: boolean;
};

interface FormsSettingsProps {
  /** When set, skip network load (Storybook/Chromatic demos). */
  initialState?: FormsSettingsInitialState;
}

function submissionLabel(count: number | undefined): string {
  const n = count ?? 0;
  return `${n.toLocaleString()} submission${n === 1 ? "" : "s"}`;
}

export function FormsSettings({ initialState }: FormsSettingsProps) {
  const portal = usePortal();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [forms, setForms] = useState<ProjectForm[]>(initialState?.forms ?? []);
  const [canManage, setCanManage] = useState(initialState?.canManage ?? false);
  const [nameDraft, setNameDraft] = useState("");
  const [slugDraft, setSlugDraft] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(Boolean(initialState));
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const org = portal.orgs.find((entry) =>
    entry.projects.some((p) => p.projectId === portal.account?.projectId),
  );
  const project = org?.projects.find(
    (p) => p.projectId === portal.account?.projectId,
  );
  const inboxBase =
    org?.orgSlug && project?.projectSlug
      ? portalWorkspacePath({
          orgSlug: org.orgSlug,
          projectSlug: project.projectSlug,
          surface: "inbox",
        })
      : null;

  const load = useCallback(async () => {
    const data = await listForms();
    setForms(data.forms);
    setCanManage(data.canManage);
  }, []);

  useEffect(() => {
    if (initialState) return;
    let cancelled = false;
    async function run() {
      setReady(false);
      setError(null);
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load forms",
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [load, initialState]);

  useEffect(() => {
    if (!showCreate) return;
    nameInputRef.current?.focus();
  }, [showCreate]);

  async function onCreate() {
    const name = nameDraft.trim();
    if (!name) {
      setError("Enter a form name");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await createForm({
        name,
        ...(slugDraft.trim() ? { slug: slugDraft.trim() } : {}),
      });
      setForms((prev) =>
        [...prev, { ...result.form, submissionCount: 0 }].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setNameDraft("");
      setSlugDraft("");
      setShowCreate(false);
      toast.success(`Created “${result.form.name}”.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create form");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(form: ProjectForm) {
    setEditingId(form.formId);
    setEditName(form.name);
    setEditSlug(form.slug);
    setError(null);
  }

  async function onSaveEdit() {
    if (!editingId) return;
    setBusy(true);
    setError(null);
    try {
      const result = await updateForm(editingId, {
        name: editName.trim(),
        slug: editSlug.trim(),
      });
      setForms((prev) =>
        prev
          .map((form) =>
            form.formId === editingId
              ? { ...result.form, submissionCount: form.submissionCount }
              : form,
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditingId(null);
      toast.success("Form updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update form");
    } finally {
      setBusy(false);
    }
  }

  async function onToggleActive(form: ProjectForm) {
    setBusy(true);
    setError(null);
    try {
      const result = await updateForm(form.formId, { active: !form.active });
      setForms((prev) =>
        prev.map((entry) =>
          entry.formId === form.formId
            ? { ...result.form, submissionCount: entry.submissionCount }
            : entry,
        ),
      );
      toast.success(
        result.form.active
          ? `“${result.form.name}” is active.`
          : `“${result.form.name}” is inactive.`,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update form");
    } finally {
      setBusy(false);
    }
  }

  function openInboxForForm(formId: string) {
    if (!inboxBase) return;
    portalNavigate(`${inboxBase}?formId=${encodeURIComponent(formId)}`);
  }

  if (!ready) {
    return <PortalSkeleton variant="settings" />;
  }

  return (
    <div className="space-y-6">
      <FadeIn
        className="border-outline-variant/15 bg-surface-container-low/60 border p-5 md:p-8"
        y={12}
      >
        <div className="mb-6">
          <p className="font-label text-outline text-[10px] tracking-widest uppercase">
            Forms
          </p>
          <p className="text-on-surface-variant mt-1 text-sm">
            {forms.length === 0
              ? "No forms yet — create one to get started."
              : `${forms.length} form${forms.length === 1 ? "" : "s"} in this project`}
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {forms.map((form) => {
            const editing = editingId === form.formId;
            return (
              <li key={form.formId}>
                <article
                  className={cn(
                    "group flex h-full flex-col border p-5 transition-colors",
                    form.active
                      ? "border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/45 hover:bg-surface-container-high/70"
                      : "border-outline-variant/15 bg-surface-container-low/40 opacity-80",
                  )}
                >
                  {editing ? (
                    <div className="flex min-h-44 flex-1 flex-col gap-3">
                      <p className="font-label text-outline text-[10px] tracking-widest uppercase">
                        Edit form
                      </p>
                      <div>
                        <Label htmlFor={`form-name-${form.formId}`}>Name</Label>
                        <Input
                          id={`form-name-${form.formId}`}
                          value={editName}
                          disabled={busy}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`form-slug-${form.formId}`}>Slug</Label>
                        <Input
                          id={`form-slug-${form.formId}`}
                          value={editSlug}
                          disabled={busy}
                          onChange={(e) => setEditSlug(e.target.value)}
                        />
                      </div>
                      <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        <Button
                          type="button"
                          size="sm"
                          className="flex-1"
                          disabled={busy || !editName.trim() || !editSlug.trim()}
                          onClick={() => void onSaveEdit()}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex min-h-28 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={cn(
                              "inline-flex size-10 items-center justify-center border",
                              form.active
                                ? "border-outline-variant/25 bg-background/40 text-outline group-hover:text-white"
                                : "border-outline-variant/20 bg-background/20 text-outline",
                            )}
                          >
                            <MaterialIcon
                              name="dynamic_form"
                              className="text-[1.25rem]!"
                            />
                          </span>
                          {!form.active ? (
                            <span className="font-label text-outline text-[10px] tracking-widest uppercase">
                              Inactive
                            </span>
                          ) : null}
                        </div>
                        <h2 className="font-headline mt-4 text-xl font-bold tracking-tight text-white">
                          {form.name}
                        </h2>
                        <p className="text-on-surface-variant mt-1 font-mono text-xs">
                          /{form.slug}
                        </p>
                        <p className="text-outline mt-3 text-sm">
                          {submissionLabel(form.submissionCount)}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2 border-t border-outline-variant/15 pt-4">
                        {inboxBase ? (
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1"
                            onClick={() => openInboxForForm(form.formId)}
                          >
                            View leads
                          </Button>
                        ) : (
                          <Button asChild size="sm" className="flex-1">
                            <PortalLink href="/portal/">View leads</PortalLink>
                          </Button>
                        )}
                        {canManage ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => startEdit(form)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => void onToggleActive(form)}
                            >
                              {form.active ? "Deactivate" : "Activate"}
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </>
                  )}
                </article>
              </li>
            );
          })}

          {canManage ? (
            <li>
              {showCreate ? (
                <div className="border-outline-variant/25 bg-surface-container-low flex h-full min-h-44 flex-col border p-5">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <p className="font-label text-outline text-[10px] tracking-widest uppercase">
                      New form
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-outline hover:text-white"
                      aria-label="Cancel create form"
                      onClick={() => {
                        setShowCreate(false);
                        setNameDraft("");
                        setSlugDraft("");
                      }}
                    >
                      <MaterialIcon name="close" className="text-base!" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="new-form-name">Form name</Label>
                      <Input
                        ref={nameInputRef}
                        id="new-form-name"
                        value={nameDraft}
                        disabled={busy}
                        onChange={(e) => setNameDraft(e.target.value)}
                        placeholder="Contact"
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;
                          e.preventDefault();
                          if (!busy && nameDraft.trim()) void onCreate();
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-form-slug">Slug (optional)</Label>
                      <Input
                        id="new-form-slug"
                        value={slugDraft}
                        disabled={busy}
                        onChange={(e) => setSlugDraft(e.target.value)}
                        placeholder="contact"
                      />
                    </div>
                    <Button
                      type="button"
                      disabled={busy || !nameDraft.trim()}
                      onClick={() => void onCreate()}
                    >
                      {busy ? "Creating…" : "Create form"}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="Create form"
                  className="border-outline-variant/25 text-outline hover:border-outline-variant/50 hover:bg-surface-container-high/50 hover:text-white flex h-full min-h-44 w-full flex-col items-center justify-center gap-3 border border-dashed transition-colors"
                  onClick={() => setShowCreate(true)}
                >
                  <span className="border-outline-variant/30 inline-flex size-12 items-center justify-center border">
                    <MaterialIcon name="add" className="text-[1.75rem]!" />
                  </span>
                  <span className="font-label text-[10px] tracking-widest uppercase">
                    New form
                  </span>
                </button>
              )}
            </li>
          ) : null}
        </ul>
      </FadeIn>

      {!canManage ? (
        <p className="text-on-surface-variant text-sm">
          Only owners and members with API key permission can create or edit
          forms.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
