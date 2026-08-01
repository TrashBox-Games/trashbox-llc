"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { PortalLink } from "@/components/features/portal/PortalLink";
import { Button } from "@/components/ui/button";
import { subscribePortalNavigate } from "@/lib/portal-routes";
import {
  PORTAL_SETTINGS_NAV,
  getSettingsSection,
  isSettingsSectionId,
  settingsSectionPath,
  type SettingsGroupId,
} from "@/lib/portal-settings";
import { cn } from "@/lib/utils";

function activeSectionFromPath(pathname: string | null | undefined) {
  if (!pathname) return null;
  const parts = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  const settingsIndex = parts.indexOf("settings");
  if (settingsIndex >= 0) {
    const after = parts[settingsIndex + 1];
    if (after && isSettingsSectionId(after)) return after;
  }
  const maybe = parts[parts.length - 1];
  return maybe && isSettingsSectionId(maybe) ? maybe : null;
}

export function SettingsSidebar() {
  const nextPath = usePathname() ?? "";
  const [pathname, setPathname] = useState(nextPath);

  useEffect(() => {
    const win = window.location.pathname;
    setPathname(win.includes("/settings/") ? win : nextPath || win);
    return subscribePortalNavigate(setPathname);
  }, [nextPath]);

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
            <Button
              type="button"
              variant="ghost"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggleGroup(group.id)}
              className={cn(
                "h-auto w-full justify-start gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium normal-case tracking-normal",
                open || activeGroupId === group.id
                  ? "text-white hover:text-white"
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
                  "text-[16px]! text-outline transition-transform duration-200 ease-out",
                  open && "rotate-180",
                )}
              />
            </Button>

            <div
              id={panelId}
              role="region"
              aria-hidden={!open}
              inert={!open ? true : undefined}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                open
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <ul className="mb-1 ml-2 space-y-0.5 border-l border-outline-variant/15 py-0.5 pl-2">
                  {group.items.map((item) => {
                    const href = settingsSectionPath(item.id);
                    const active = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <PortalLink
                          href={href}
                          tabIndex={open ? undefined : -1}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors duration-150",
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
                        </PortalLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
