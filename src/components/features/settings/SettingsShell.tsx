"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";
import {
  DEFAULT_SETTINGS_SECTION,
  getSettingsSection,
  isSettingsSectionId,
} from "@/lib/portal-settings";

interface SettingsShellProps {
  children: ReactNode;
}

function sectionIdFromPath(pathname: string | null | undefined) {
  if (!pathname) return DEFAULT_SETTINGS_SECTION;
  const parts = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  const maybe = parts[parts.length - 1];
  if (maybe && isSettingsSectionId(maybe)) return maybe;
  if (maybe === "settings") return DEFAULT_SETTINGS_SECTION;
  return DEFAULT_SETTINGS_SECTION;
}

export function SettingsShell({ children }: SettingsShellProps) {
  const pathname = usePathname() ?? "";
  const sectionId = sectionIdFromPath(pathname);
  const section = getSettingsSection(sectionId);

  return (
    <div className="space-y-10">
      <header>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
          Settings
        </p>
        <h1 className="max-w-4xl font-headline text-4xl font-bold leading-tight tracking-tighter text-white md:text-6xl">
          Settings
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low/40 p-2 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
            <SettingsSidebar />
          </div>
        </aside>

        <div className="min-w-0 space-y-6 lg:col-span-9">
          <div>
            {section?.groupLabel && (
              <p className="mb-2 font-label text-[10px] uppercase tracking-widest text-outline">
                {section.groupLabel}
              </p>
            )}
            <h2 className="font-headline text-2xl font-bold tracking-tight text-white md:text-3xl">
              {section?.label ?? "Settings"}
            </h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
