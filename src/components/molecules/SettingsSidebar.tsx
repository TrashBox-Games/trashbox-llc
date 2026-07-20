"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import {
  PORTAL_SETTINGS_NAV,
  getSettingsSection,
  isSettingsSectionId,
  settingsSectionPath,
  type SettingsGroupId,
} from "@/lib/portal-settings";
import { cn } from "@/lib/utils";

function activeSectionFromPath(pathname: string) {
  const parts = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  const maybe = parts[parts.length - 1];
  return maybe && isSettingsSectionId(maybe) ? maybe : null;
}

export function SettingsSidebar() {
  const pathname = usePathname();
  const activeSection = activeSectionFromPath(pathname);
  const activeGroupId =
    (activeSection && getSettingsSection(activeSection)?.groupId) || null;

  const [openGroups, setOpenGroups] = useState<Set<SettingsGroupId>>(() => {
    const initial = new Set<SettingsGroupId>();
    if (activeGroupId) initial.add(activeGroupId);
    else initial.add("workspace");
    return initial;
  });

  useEffect(() => {
    if (!activeGroupId) return;
    setOpenGroups((prev) => {
      if (prev.has(activeGroupId)) return prev;
      const next = new Set(prev);
      next.add(activeGroupId);
      return next;
    });
  }, [activeGroupId]);

  function toggleGroup(id: SettingsGroupId) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <nav aria-label="Settings" className="space-y-0.5">
      {PORTAL_SETTINGS_NAV.map((group) => {
        const open = openGroups.has(group.id);
        const panelId = `settings-group-${group.id}`;

        return (
          <div key={group.id}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggleGroup(group.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium transition-colors",
                open || activeGroupId === group.id
                  ? "text-white"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-white",
              )}
            >
              <MaterialIcon
                name={group.icon}
                className="text-[16px]! text-outline"
              />
              <span className="min-w-0 flex-1 truncate">{group.label}</span>
              <MaterialIcon
                name="expand_more"
                className={cn(
                  "text-[16px]! text-outline transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>

            {open && (
              <ul id={panelId} className="mb-1 ml-2 space-y-0.5 border-l border-outline-variant/15 pl-2">
                {group.items.map((item) => {
                  const href = settingsSectionPath(item.id);
                  const active = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors",
                          active
                            ? "bg-surface-container-high font-medium text-white"
                            : "text-on-surface-variant hover:bg-surface-container-high/70 hover:text-white",
                        )}
                      >
                        <MaterialIcon
                          name={item.icon}
                          className={cn(
                            "text-[15px]!",
                            active ? "text-white" : "text-outline",
                          )}
                        />
                        <span className="min-w-0 truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
