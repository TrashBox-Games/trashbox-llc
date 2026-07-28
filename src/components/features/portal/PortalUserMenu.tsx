"use client";

import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PortalUserMenuProps {
  email: string;
  name?: string | null;
  clientName?: string | null;
  onSignOut: () => void | Promise<void>;
}

function titleCaseFromLocalPart(local: string): string {
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/** Prefer an explicit name; otherwise derive a readable label from the email local part. */
export function portalUserDisplayName(
  email: string,
  name?: string | null,
): string {
  const trimmed = name?.trim();
  if (trimmed && trimmed.toLowerCase() !== email.toLowerCase()) {
    return trimmed;
  }
  const local = email.split("@")[0] ?? "";
  return titleCaseFromLocalPart(local) || email;
}

function initialsFromLabel(label: string): string {
  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return (label.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2) || "?").toUpperCase();
}

function UserAvatar({
  label,
  size,
}: {
  label: string;
  size: "sm" | "md";
}): JSX.Element {
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-outline-variant/30 bg-white/10 font-bold tracking-wide text-white",
        size === "sm" && "size-8 text-[10px]",
        size === "md" && "size-10 text-xs",
      )}
    >
      {initialsFromLabel(label)}
    </span>
  );
}

/** Account trigger + panel for signed-in portal users. */
export function PortalUserMenu({
  email,
  name,
  clientName,
  onSignOut,
}: PortalUserMenuProps): JSX.Element {
  const displayName = portalUserDisplayName(email, name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-full p-0 hover:bg-transparent"
          aria-label="Account menu"
        >
          <UserAvatar label={displayName} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-1">
            <UserAvatar label={displayName} size="md" />
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-foreground">
                {displayName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
              {clientName ? (
                <span className="font-label truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                  {clientName}
                </span>
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            void onSignOut();
          }}
        >
          <MaterialIcon name="logout" className="text-base!" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
