"use client";
import { useEffect } from "react";
import { analyticsConsented, trackPurchase, type PurchaseData } from "@/lib/analytics/events";
export function PurchaseTracker({ order }: { order: PurchaseData }) {
  useEffect(() => {
    let pending = false;
    let finished = false;
    let disposed = false;
    let retryCount = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const run = async () => {
      if (
        disposed || pending || finished || !analyticsConsented() ||
        (order.paymentStatus !== "paid" && order.paymentStatus !== "cod_pending")
      ) return;
      clearTimeout(retryTimer);
      pending = true;
      try {
        const response = await fetch("/api/tracking/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id, consent: true }),
        });
        if (!response.ok) {
          // Retry temporary failures only. Never bypass the database claim.
          if (response.status === 429 || response.status >= 500) throw new Error("Retry purchase claim");
          finished = true;
          return;
        }
        const result = await response.json();
        finished = true;
        if (result.claimed === true) trackPurchase(order);
      } catch {
        // Three bounded retries cover short database/network outages after redirect.
        if (!disposed && retryCount < 3) {
          retryTimer = setTimeout(() => { void run(); }, 1000 * 2 ** retryCount++);
        }
      } finally {
        pending = false;
      }
    };
    void run();
    window.addEventListener("vara:consent", run);
    window.addEventListener("online", run);
    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      window.removeEventListener("vara:consent", run);
      window.removeEventListener("online", run);
    };
  }, [order]);
  return null;
}
