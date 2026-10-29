"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewStatus } from "@/features/reviews/types";
export function ReviewModeration({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function update(status: ReviewStatus) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Could not update review. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["approved", "Approve"],
            ["rejected", "Reject"],
            ["pending", "Return to pending"],
          ] as const
        ).map(([status, label]) => (
          <button
            key={status}
            disabled={busy}
            onClick={() => void update(status)}
            className="border-navy/20 rounded border px-3 py-2 text-sm disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
      <p role="status" className="text-danger mt-2 text-sm">
        {error}
      </p>
    </div>
  );
}
