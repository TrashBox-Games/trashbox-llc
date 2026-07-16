"use client";

import { useEffect } from "react";

export function useHashScroll(hash: string) {
  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== hash) return;
    requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    });
  }, [hash]);
}
