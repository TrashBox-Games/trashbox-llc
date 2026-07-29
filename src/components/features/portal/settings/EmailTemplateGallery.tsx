"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  EMAIL_TEMPLATE_STARTERS,
  EMAIL_TEMPLATE_STARTER_CATEGORIES,
  startersByCategory,
  starterThumbnailPreview,
  type EmailTemplateStarter,
  type EmailTemplateStarterCategory,
} from "@/lib/email-template-starters";

export interface EmailTemplateGallerySavedItem {
  id: string;
  name: string;
  subject?: string;
}

export interface EmailTemplateGalleryProps {
  mode: "create" | "compose";
  starters?: readonly EmailTemplateStarter[];
  savedTemplates?: readonly EmailTemplateGallerySavedItem[];
  onSelectStarter: (starter: EmailTemplateStarter) => void;
  onSelectSaved?: (template: EmailTemplateGallerySavedItem) => void;
  onInsertHtmlPlainText?: () => void;
  onClose?: () => void;
  className?: string;
}

function StarterThumbnail({
  starter,
}: {
  starter: EmailTemplateStarter;
}): ReactElement {
  const preview = starterThumbnailPreview(starter.thumbnail);
  return (
    <div
      aria-hidden
      className="flex h-36 items-start justify-center overflow-hidden border border-outline-variant/20 bg-white p-3"
    >
      {starter.thumbnail === "blank" ? (
        <div className="h-full w-full bg-white" />
      ) : (
        <div
          className="w-full scale-90 origin-top"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      )}
    </div>
  );
}

function categoryHeading(
  id: "all" | EmailTemplateStarterCategory,
): string {
  return (
    EMAIL_TEMPLATE_STARTER_CATEGORIES.find((item) => item.id === id)?.label ??
    id
  );
}

export function EmailTemplateGallery({
  mode,
  starters = EMAIL_TEMPLATE_STARTERS,
  savedTemplates = [],
  onSelectStarter,
  onSelectSaved,
  onInsertHtmlPlainText,
  onClose,
  className,
}: EmailTemplateGalleryProps): ReactElement {
  const [category, setCategory] = useState<"all" | EmailTemplateStarterCategory>(
    "all",
  );

  const catalog = useMemo(() => {
    if (category === "all") return [...starters];
    return starters.filter((starter) => starter.category === category);
  }, [category, starters]);

  const grouped = useMemo(() => {
    if (category !== "all") {
      return [{ id: category, items: catalog }] as const;
    }
    const order = EMAIL_TEMPLATE_STARTER_CATEGORIES.filter(
      (item) => item.id !== "all",
    );
    return order
      .map((item) => ({
        id: item.id,
        items: startersByCategory(item.id).filter((starter) =>
          starters.some((s) => s.id === starter.id),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [catalog, category, starters]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Template Gallery"
      className={cn(
        "flex max-h-[min(90vh,720px)] min-h-[420px] flex-col border border-outline-variant/20 bg-surface-container-low",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/15 px-4 py-3 md:px-6">
        <Label className="mb-0 text-white">Template Gallery</Label>
        <div className="flex flex-wrap items-center gap-2">
          {mode === "create" && onInsertHtmlPlainText && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onInsertHtmlPlainText}
            >
              Insert HTML / Plain Text
            </Button>
          )}
          {onClose && (
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <nav
          aria-label="Template categories"
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-outline-variant/15 p-3 md:w-44 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r"
        >
          {EMAIL_TEMPLATE_STARTER_CATEGORIES.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
              className={cn(
                "justify-start text-left",
                category === item.id && "text-white",
              )}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto p-4 md:p-6">
          {mode === "compose" && (
            <section aria-label="Your templates">
              <h3 className="font-label text-[10px] uppercase tracking-widest text-outline">
                Your templates ({savedTemplates.length})
              </h3>
              {savedTemplates.length === 0 ? (
                <p className="mt-3 text-sm text-on-surface-variant">
                  No saved templates yet. Pick a starter below, or manage
                  templates in Settings.
                </p>
              ) : (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {savedTemplates.map((template) => (
                    <li key={template.id}>
                      <button
                        type="button"
                        onClick={() => onSelectSaved?.(template)}
                        className="w-full border border-outline-variant/20 bg-background/40 p-3 text-left transition-colors hover:border-outline-variant/40 hover:bg-background/60"
                      >
                        <div
                          aria-hidden
                          className="mb-3 flex h-24 items-center justify-center border border-outline-variant/15 bg-white/90"
                        >
                          <span className="font-label text-[9px] uppercase tracking-widest text-outline">
                            Saved
                          </span>
                        </div>
                        <p className="text-sm text-white">{template.name}</p>
                        {template.subject ? (
                          <p className="mt-1 truncate text-xs text-on-surface-variant">
                            {template.subject}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {grouped.map((group) => (
            <section
              key={group.id}
              aria-label={`${categoryHeading(group.id)} starters`}
            >
              <h3 className="font-label text-[10px] uppercase tracking-widest text-outline">
                {categoryHeading(group.id)} ({group.items.length})
              </h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((starter) => (
                  <li key={starter.id}>
                    <button
                      type="button"
                      onClick={() => onSelectStarter(starter)}
                      className="w-full border border-outline-variant/20 bg-background/40 p-3 text-left transition-colors hover:border-outline-variant/40 hover:bg-background/60"
                    >
                      <StarterThumbnail starter={starter} />
                      <p className="mt-3 text-sm text-white">{starter.name}</p>
                      {starter.subject ? (
                        <p className="mt-1 truncate text-xs text-on-surface-variant">
                          {starter.subject}
                        </p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
