import { FadeIn } from "@/components/atoms/FadeIn";
import { cn } from "@/lib/utils";

interface LeadInboxEmptyDetailProps {
  /** True when filters are active and produced an empty list. */
  filtered?: boolean;
  /** `empty` = no leads; `select` = leads exist but none open. */
  variant?: "empty" | "select";
  className?: string;
}

/** Main detail-pane placeholder when there is no open lead thread. */
export function LeadInboxEmptyDetail({
  filtered = false,
  variant = "empty",
  className,
}: LeadInboxEmptyDetailProps) {
  const title =
    variant === "select"
      ? "Select a lead"
      : filtered
        ? "No matching leads"
        : "Inbox is clear";
  const body =
    variant === "select"
      ? "Choose a submission from the list to open the conversation here."
      : filtered
        ? "Try clearing filters or switching forms to see more leads."
        : "New form submissions will show up here — pick one from the list to open the thread.";

  return (
    <div
      className={cn(
        "bg-surface-container-low flex min-h-[28rem] flex-col items-center justify-center rounded-lg px-6 py-16 md:min-h-[calc(100vh-7rem)] md:px-10",
        className,
      )}
    >
      <FadeIn className="flex max-w-md flex-col items-center text-center">
        <EmptyInboxGraphic />
        <h2 className="font-headline mt-10 text-3xl font-bold tracking-tight text-white md:text-4xl">
          {title}
        </h2>
        <p className="text-on-surface-variant mt-4 text-base leading-relaxed">
          {body}
        </p>
      </FadeIn>
    </div>
  );
}

function EmptyInboxGraphic() {
  return (
    <svg
      role="img"
      aria-label="Empty inbox"
      viewBox="0 0 200 150"
      className="text-outline h-36 w-auto md:h-44"
      fill="none"
    >
      <rect
        x="24"
        y="44"
        width="152"
        height="86"
        rx="10"
        className="fill-surface-container-high/40 stroke-outline-variant/35"
        strokeWidth="1.5"
      />
      <path
        d="M24 62h152"
        className="stroke-outline-variant/25"
        strokeWidth="1.5"
      />
      <rect
        x="48"
        y="78"
        width="104"
        height="10"
        rx="5"
        className="fill-outline-variant/15"
      />
      <rect
        x="60"
        y="98"
        width="80"
        height="10"
        rx="5"
        className="fill-outline-variant/10"
      />
      <path
        d="M40 138c18 10 52 16 60 16s42-6 60-16"
        className="stroke-outline-variant/20"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
