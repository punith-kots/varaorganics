import "server-only";
import { randomUUID } from "node:crypto";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import type { Review, ReviewStatus } from "./types";
const state = globalThis as typeof globalThis & { __varaReviews?: Review[] };
const memory = () => (state.__varaReviews ??= []);
export async function listReviews(productId?: string): Promise<Review[]> {
  if (USE_MOCK_DATA)
    return memory()
      .filter((r) => !productId || (r.product_id === productId && r.status === "approved"))
      .slice(0, 200);
  const sb = getAdminSupabase();
  if (!sb) throw new Error("Reviews unavailable");
  let query = sb
    .from("product_reviews")
    .select("id,product_id,product_name,author_name,rating,body,status,created_at")
    .order("created_at", { ascending: false })
    .limit(productId ? 50 : 200);
  if (productId) query = query.eq("product_id", productId).eq("status", "approved");
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Review[];
}
export async function submitReview(
  input: Pick<Review, "product_id" | "product_name" | "author_name" | "rating" | "body">,
) {
  const row: Review = {
    ...input,
    id: randomUUID(),
    status: "pending",
    created_at: new Date().toISOString(),
  };
  if (USE_MOCK_DATA) {
    memory().unshift(row);
    return;
  }
  const sb = getAdminSupabase();
  if (!sb) throw new Error("Reviews unavailable");
  const { error } = await sb.from("product_reviews").insert(row);
  if (error) throw error;
}
export async function moderateReview(id: string, status: ReviewStatus): Promise<boolean> {
  if (USE_MOCK_DATA) {
    const row = memory().find((r) => r.id === id);
    if (!row) return false;
    row.status = status;
    return true;
  }
  const sb = getAdminSupabase();
  if (!sb) throw new Error("Reviews unavailable");
  const { data, error } = await sb
    .from("product_reviews")
    .update({ status, moderated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return data?.length === 1;
}
