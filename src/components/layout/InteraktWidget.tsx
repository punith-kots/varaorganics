"use client";

import Script from "next/script";

type InteraktWindow = Window & {
  kiwi?: { init: (target: string, token: string, options: Record<string, unknown>) => void };
};

let initialized = false;

export function InteraktWidget() {
  return (
    <Script
      id="interakt-sdk"
      src="https://app.interakt.ai/kiwi-sdk/kiwi-sdk-17-prod-min.js"
      strategy="afterInteractive"
      onReady={() => {
        const kiwi = (window as InteraktWindow).kiwi;
        if (initialized || !kiwi) return;
        kiwi.init("", "sgEVVvxcA2cgkyb8MoQiVQ47tXGGJK1b", {});
        initialized = true;
      }}
    />
  );
}
