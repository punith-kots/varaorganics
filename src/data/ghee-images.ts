import type { ProductImage } from "@/types";

// Approved product photography supplied by Vara. Shared by live and mock products.
export const GHEE_SQUARE_IMAGE = "/product-images/vara-ghee-square.jpg";
export const GHEE_PORTRAIT_IMAGE = "/product-images/vara-ghee-portrait.jpg";

export const gheeImages: ProductImage[] = [
  {
    id: "vara-ghee-square",
    url: GHEE_SQUARE_IMAGE,
    alt: "Vara A2 Gir Cow Ghee jar with a bowl and spoon of ghee",
    position: 0,
  },
  {
    id: "vara-ghee-portrait",
    url: GHEE_PORTRAIT_IMAGE,
    alt: "Vara A2 Gir Cow Ghee jar on a stone serving board",
    position: 1,
  },
];
