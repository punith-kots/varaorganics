export type ReviewStatus = "pending" | "approved" | "rejected";
export interface Review {
  id: string;
  product_id: string;
  product_name: string;
  author_name: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  created_at: string;
}
