"use client";

import { useEffect } from "react";
import { PLATFORM_PATHS } from "@/lib/sites";

/** Static-export friendly redirect from legacy /email to /platform. */
export function EmailRedirect() {
  useEffect(() => {
    window.location.replace(PLATFORM_PATHS.hub);
  }, []);

  return (
    <div className="mx-auto max-w-screen-2xl px-8 pt-32 pb-24">
      <p className="font-label text-xs uppercase tracking-widest text-outline">
        Redirecting to Platform…
      </p>
      <a href={PLATFORM_PATHS.hub} className="mt-4 inline-block text-white underline">
        Continue to /platform
      </a>
    </div>
  );
}
