import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/auth";
import { listReviews } from "@/features/reviews/store";
import { ReviewModeration } from "@/components/admin/ReviewModeration";
export const dynamic = "force-dynamic";
export default async function ReviewsPage() {
  if (!(await getAdminUser())) redirect("/admin/login");
  const reviews = await listReviews().catch(() => null);
  return (
    <main>
      <h1 className="font-serif text-3xl">Review approval</h1>
      <p className="text-navy/60 my-4">
        Only approved reviews appear on product pages. Showing the latest 200 submissions.
      </p>
      {reviews === null ? (
        <p>Reviews are unavailable. Check the database connection and apply migration 0011.</p>
      ) : reviews.length === 0 ? (
        <p>No reviews submitted yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded border bg-white p-5">
              <h2 className="font-semibold">
                {r.product_name} — {r.author_name}
              </h2>
              <p className="text-sm">
                {r.rating}/5 · {r.status} · {r.created_at.slice(0, 10)}
              </p>
              <p className="my-3 break-words whitespace-pre-wrap">{r.body}</p>
              <ReviewModeration id={r.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
