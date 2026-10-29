import { z } from "zod";
import { getStoreProducts } from "@/features/products/queries";
import { listReviews, submitReview } from "@/features/reviews/store";
import { checkRateLimit, clientIp } from "@/lib/security/rate-limit";
export const runtime = "nodejs";
const schema = z.object({
  productId: z.string().min(1).max(100),
  name: z.string().trim().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(),
});
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("productId");
  if (!id || id.length > 100)
    return Response.json({ message: "Product is required" }, { status: 422 });
  try {
    return Response.json(
      { reviews: await listReviews(id) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ message: "Reviews are temporarily unavailable" }, { status: 503 });
  }
}
export async function POST(req: Request) {
  if (!checkRateLimit(`reviews:${clientIp(req.headers)}`, 3, 60 * 60 * 1000).success)
    return Response.json(
      { message: "Please wait before submitting another review." },
      { status: 429 },
    );
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { message: "Enter your name, a rating from 1 to 5, and a review of 10–2000 characters." },
      { status: 422 },
    );
  try {
    const product = (await getStoreProducts()).find(
      (p) => p.id === parsed.data.productId && p.active,
    );
    if (!product) return Response.json({ message: "Product not found" }, { status: 404 });
    await submitReview({
      product_id: product.id,
      product_name: product.productName,
      author_name: parsed.data.name,
      rating: parsed.data.rating,
      body: parsed.data.body,
    });
    return Response.json(
      { message: "Thank you. Your review will appear after approval." },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { message: "Could not save your review. Please try later." },
      { status: 503 },
    );
  }
}
