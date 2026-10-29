"use client";
import { useEffect, useRef } from "react";
/** Retry page impressions on consent, but never replay historical cart actions. */
export function useConsentTracking(track: () => boolean, key: string) {
  const fired = useRef<string | null>(null);
  useEffect(() => {
    const run = () => {
      if (fired.current !== key && track()) fired.current = key;
    };
    run();
    window.addEventListener("vara:consent", run);
    return () => window.removeEventListener("vara:consent", run);
  }, [track, key]);
}
