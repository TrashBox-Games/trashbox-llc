export interface GeneralSettingsProps {
  email: string;
  clientName?: string | null;
  tier?: string | null;
  active?: boolean;
  emailsUsed?: number | null;
  emailLimit?: number | null;
}

export function GeneralSettings({
  email,
  clientName,
  tier,
  active = true,
  emailsUsed,
  emailLimit,
}: GeneralSettingsProps) {
  const showUsage =
    typeof emailsUsed === "number" && typeof emailLimit === "number";

  return (
    <div className="border-outline-variant/10 bg-surface-container-low space-y-8 border p-6 md:p-8">
      <div>
        <p className="font-label text-outline text-[10px] tracking-widest uppercase">
          Signed in
        </p>
        <p className="mt-1 text-white">{email}</p>
        {clientName && (
          <p className="text-on-surface-variant mt-1 text-sm">
            Client: {clientName}
          </p>
        )}
        {tier && (
          <p className="font-label text-outline mt-2 text-[10px] tracking-widest uppercase">
            Plan: <span className="text-white">{tier}</span>
            {!active ? " · inactive" : ""}
            {showUsage && (
              <>
                {" "}
                · Usage:{" "}
                <span className="text-white">
                  {emailsUsed.toLocaleString()} / {emailLimit.toLocaleString()}
                </span>{" "}
                emails
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
