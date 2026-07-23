import { API_DOCS_URL } from "@/lib/sites";
import type { SettingsSectionId } from "@/lib/portal-settings";

interface SettingsPlaceholderProps {
  sectionId: SettingsSectionId;
  title: string;
}

/** Empty-state copy for settings sections that are not built yet. */
export function SettingsPlaceholder({
  sectionId,
  title,
}: SettingsPlaceholderProps) {
  if (sectionId === "api-documentation") {
    return (
      <div className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
        <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          Form API reference lives on the public docs site.
        </p>
        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block font-headline text-xs font-bold uppercase tracking-widest text-white underline-offset-4 hover:underline"
        >
          Open API documentation
        </a>
      </div>
    );
  }

  return (
    <div className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
      <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
        {title} settings are coming soon. This section is reserved for future
        configuration.
      </p>
    </div>
  );
}
