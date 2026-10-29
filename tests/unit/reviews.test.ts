// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ admin: false }));
vi.mock("@/lib/validation/env", () => ({ USE_MOCK_DATA: true }));
vi.mock("@/lib/supabase/auth", () => ({
  getAdminUser: async () => (state.admin ? { id: "admin" } : null),
}));
vi.mock("@/features/products/queries", () => ({
  getStoreProducts: async () => [{ id: "product-1", productName: "Ghee", active: true }],
}));
import { GET, POST } from "@/app/api/reviews/route";
import { PATCH } from "@/app/api/admin/reviews/route";
import { listReviews } from "@/features/reviews/store";
let ip = 0;
const submission = (extra = {}) =>
  new Request("https://varaorganic.com/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-real-ip": `192.0.2.${++ip}` },
    body: JSON.stringify({
      productId: "product-1",
      name: "Buyer",
      rating: 5,
      body: "Lovely ghee, thank you!",
      website: "",
      ...extra,
    }),
  });
const publicList = () =>
  GET(new Request("https://varaorganic.com/api/reviews?productId=product-1"));
const update = (id: string, status: string) =>
  PATCH(
    new Request("https://varaorganic.com/api/admin/reviews", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    }),
  );
beforeEach(() => {
  state.admin = false;
  (globalThis as typeof globalThis & { __varaReviews?: unknown[] }).__varaReviews = [];
});
it("cannot self-approve; only admin approval makes a review public and rejection hides it", async () => {
  expect((await POST(submission({ status: "approved" }))).status).toBe(201);
  expect((await (await publicList()).json()).reviews).toEqual([]);
  const review = (await listReviews())[0]!;
  expect(review.status).toBe("pending");
  expect((await update(review.id, "approved")).status).toBe(401);
  state.admin = true;
  expect((await update(review.id, "approved")).status).toBe(200);
  expect((await (await publicList()).json()).reviews).toHaveLength(1);
  await update(review.id, "rejected");
  expect((await (await publicList()).json()).reviews).toEqual([]);
});
it("rejects invalid ratings, spam field, missing product and malformed updates", async () => {
  expect((await POST(submission({ rating: 6 }))).status).toBe(422);
  expect((await POST(submission({ website: "spam" }))).status).toBe(422);
  expect((await POST(submission({ productId: "unknown" }))).status).toBe(404);
  expect((await GET(new Request("https://varaorganic.com/api/reviews"))).status).toBe(422);
  state.admin = true;
  expect((await update("invalid", "approved")).status).toBe(422);
});
it("rate-limits repeated submissions", async () => {
  const make = () =>
    new Request("https://varaorganic.com/api/reviews", {
      method: "POST",
      headers: { "x-real-ip": "rate-test" },
      body: JSON.stringify({
        productId: "product-1",
        name: "Buyer",
        rating: 4,
        body: "A lovely product.",
      }),
    });
  for (let n = 0; n < 3; n++) expect((await POST(make())).status).toBe(201);
  expect((await POST(make())).status).toBe(429);
});
