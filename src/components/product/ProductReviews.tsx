"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Review } from "@/features/reviews/types";
import { inputClass } from "@/components/forms/Field";
export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setReviews(data.reviews);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name: data.get("name"),
          rating: Number(data.get("rating")),
          body: data.get("body"),
          website: data.get("website"),
        }),
      });
      const result = await response.json();
      setMessage(result.message);
      if (response.ok) form.reset();
    } catch {
      setMessage("Could not save your review. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-labelledby="reviews-heading" className="border-navy/10 mt-12 border-t pt-8">
      <h2 id="reviews-heading" className="text-navy font-serif text-2xl">
        Customer reviews
      </h2>
      {loading ? (
        <p className="my-4">Loading reviews…</p>
      ) : loadError ? (
        <p className="my-4">Reviews are temporarily unavailable.</p>
      ) : reviews.length === 0 ? (
        <p className="text-navy/60 my-4">No approved reviews yet. Share your experience below.</p>
      ) : (
        <ul className="my-6 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-navy/10 rounded border p-4">
              <p className="font-semibold">
                {r.author_name}{" "}
                <span aria-label={`${r.rating} out of 5 stars`} className="text-amber ml-2">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </p>
              <p className="mt-2 break-words whitespace-pre-wrap">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={submit} className="mt-6 grid max-w-xl gap-4">
        <h3 className="font-semibold">Write a review</h3>
        <label>
          Your name
          <input name="name" required minLength={2} maxLength={80} className={inputClass(false)} />
        </label>
        <label>
          Rating
          <select name="rating" required defaultValue="" className={inputClass(false)}>
            <option value="" disabled>
              Select rating
            </option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} out of 5
              </option>
            ))}
          </select>
        </label>
        <label>
          Your review
          <textarea
            name="body"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            className={inputClass(false)}
          />
        </label>
        <div hidden aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <p className="text-navy/60 text-sm">
          Your name and review become public only after approval.
        </p>
        <button
          disabled={busy}
          className="bg-navy rounded px-5 py-3 text-white disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit review"}
        </button>
        <p role="status">{message}</p>
      </form>
    </section>
  );
}
