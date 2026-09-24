import type { FaqItem } from "@/types";

/**
 * Curated brand FAQs surfaced as FAQPage structured data on the homepage
 * (supplied by the SEO brief, Sep 2026). The /faqs page has its own, larger
 * FAQ set + schema; this is the concise top-level set for the homepage.
 */
export const homeFaqs: FaqItem[] = [
  {
    question: "What is A2 Gir Cow Bilona Ghee?",
    answer:
      "A2 Gir Cow Bilona Ghee is made from the milk of Gir cows, which naturally produce A2 beta-casein protein. It is prepared using the traditional bilona method — milk is first cultured into curd, hand-churned into butter, and then slow-cooked on a wood fire into ghee, without any machine separation or shortcuts.",
  },
  {
    question: "Is Vara Organic ghee lab tested?",
    answer:
      "Yes. Every batch of Vara Organic ghee is independently lab tested by an NABL-accredited laboratory before it ships. You can scan the QR code on the jar to view the batch-specific lab report and verify purity.",
  },
  {
    question: "What is the difference between wood-pressed and cold-pressed oil?",
    answer:
      "Wood-pressed (ghani) oil is extracted slowly using a traditional wooden press, generating minimal heat and preserving natural nutrients and flavour. Cold-pressed oil uses a mechanical screw press, which is faster and more scalable but does not follow the same traditional extraction process. Vara Organic oils are wood-pressed for authenticity and nutrition retention.",
  },
  {
    question: "Does Vara Organic ghee contain any additives or preservatives?",
    answer:
      "No. Vara Organic ghee contains no additives, fillers, colours, or preservatives. It is 100% pure milk fat from Desi Gir cow's A2 milk.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Due to the nature of our food products, we do not accept returns based on taste, colour, or odour preference, as natural variation is expected in unprocessed products. We accept returns only for products damaged in transit, wrong items delivered, or genuine safety concerns, reported within 48 hours of delivery with photo or video proof.",
  },
  {
    question: "Where does Vara Organic ship to?",
    answer:
      "Vara Organic currently ships across India. Orders within Bengaluru above ₹999 qualify for free delivery. Orders below ₹999 within Bengaluru and all orders to the rest of India have a nominal delivery charge.",
  },
  {
    question:
      "Why does the colour, taste, or texture of the ghee vary slightly between batches?",
    answer:
      "Because our products are natural, unprocessed, and free from artificial stabilizers or colour correction, minor batch-to-batch variation in colour, odour, or taste can occur. This is normal and reflects the absence of artificial processing, not a quality issue.",
  },
  {
    question: "How can I verify the authenticity of my Vara Organic product?",
    answer:
      "Every Vara Organic jar carries a QR code linking to the batch-specific NABL lab report, so you can verify purity and test results before or after purchase.",
  },
  {
    question: "Does Vara Organic offer wholesale or bulk orders?",
    answer:
      "Yes, Vara Organic offers wholesale (B2B), HoReCa, and export pricing for bulk orders. Please contact us at hello@varaorganic.com for wholesale pricing and minimum order quantities.",
  },
  {
    question: "Is Vara Organic ghee suitable for daily cooking?",
    answer:
      "Yes, A2 Gir Cow Bilona Ghee is well suited for daily cooking, frying, and tempering, and is traditionally also used in cooking, sweets, and as a topping for rice, rotis, and vegetables.",
  },
];
