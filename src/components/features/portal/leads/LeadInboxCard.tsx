"use client";

import type { CSSProperties, JSX } from "react";
import { LeadStatusBadge } from "@/components/features/portal/leads/LeadStatusBadge";
import { Button } from "@/components/ui/button";
import type { LeadStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Visible cards in the stack: front card + up to 2 peeking layers below. */
export function inboxCardStackDepth(replyCount: number): number {
  if (replyCount <= 0) return 1;
  return Math.min(3, replyCount + 1);
}

/** Equal step for each under-card (down + right). */
const STACK_STEP = "0.5rem";

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export interface LeadInboxCardProps {
  senderName: string;
  senderEmail: string;
  message: string;
  submittedAt: string;
  status: LeadStatus;
  active?: boolean;
  /** Number of email replies on the thread (not including the form submission). */
  replyCount?: number;
  assignedTo?: string | null;
  /**
   * "list" is the vertical master-list card (default). "activity" is the
   * compact horizontal card used in the Recent Activity rail.
   */
  variant?: "list" | "activity";
  onSelect: () => void;
}

export function LeadInboxCard({
  senderName,
  senderEmail,
  message,
  submittedAt,
  status,
  active = false,
  replyCount = 0,
  assignedTo,
  variant = "list",
  onSelect,
}: LeadInboxCardProps): JSX.Element {
  if (variant === "activity") {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={onSelect}
        aria-pressed={active}
        className={cn(
          "h-auto w-[300px] shrink-0 snap-start flex-col items-stretch justify-start whitespace-normal rounded p-5 text-left font-normal normal-case tracking-normal text-inherit",
          active
            ? "bg-surface-container-high shadow-md hover:bg-surface-container-high"
            : "bg-surface-container-low hover:bg-surface-container",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-headline text-base font-bold text-white">
              {senderName}
            </p>
            <p className="mt-0.5 truncate text-xs text-outline">
              {senderEmail}
            </p>
          </div>
          <LeadStatusBadge status={status} />
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-on-surface">{message}</p>
        {assignedTo && (
          <p className="mt-2 truncate font-label text-[10px] uppercase tracking-widest text-outline-variant">
            Assigned: {assignedTo}
          </p>
        )}
        <p className="mt-3 font-mono text-[10px] uppercase text-outline-variant">
          {formatWhen(submittedAt)}
          {replyCount > 0 && (
            <>
              {" · "}
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </>
          )}
        </p>
      </Button>
    );
  }

  const depth = inboxCardStackDepth(replyCount);
  const behind = depth - 1;

  return (
    <div
      className={cn(
        // Clearance for the offset stack shadows so list gap stays even.
        behind === 1 && "pb-2 pr-2",
        behind >= 2 && "pb-4 pr-4",
      )}
      data-testid={behind > 0 ? "inbox-card-stack" : undefined}
      data-stack-behind={behind > 0 ? behind : undefined}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={onSelect}
        data-stack-depth={depth}
        aria-pressed={active}
        className={cn(
          "relative z-10 h-auto w-full flex-col items-stretch justify-start whitespace-normal px-5 py-4 text-left font-normal normal-case tracking-normal text-inherit",
          active
            ? "bg-surface-container-high hover:bg-surface-container-high"
            : "bg-surface-container-low hover:bg-surface-container-high",
          behind === 1 && "[box-shadow:var(--stack-1-fill)]",
          behind >= 2 &&
            "[box-shadow:var(--stack-1-fill),var(--stack-2-fill)]",
        )}
        style={
          behind > 0
            ? ({
                "--stack-1-fill": `${STACK_STEP} ${STACK_STEP} 0 0 var(--color-surface-container-high)`,
                "--stack-2-fill": `calc(${STACK_STEP} * 2) calc(${STACK_STEP} * 2) 0 0 var(--color-surface-container-highest)`,
              } as CSSProperties)
            : undefined
        }
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-headline text-sm font-bold text-white">
            {senderName}
          </p>
          <LeadStatusBadge status={status} />
        </div>
        <p className="mt-1 text-xs text-outline">{senderEmail}</p>
        <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
          {message}
        </p>
        {assignedTo && (
          <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-outline">
            Assigned: {assignedTo}
          </p>
        )}
        <p className="mt-3 font-label text-[10px] uppercase tracking-widest text-outline">
          {formatWhen(submittedAt)}
          {replyCount > 0 && (
            <>
              {" · "}
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </>
          )}
        </p>
      </Button>
    </div>
  );
}
