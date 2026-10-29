import type { Metadata } from "next";
import { ContentPage } from "@/components/ui/ContentPage";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Return and Refund Policy",
  description:
    "Report expired, spoiled, damaged or incorrect products within 24 hours of delivery with photo proof.",
  path: "returns",
});

export default function PolicyPage() {
  return (
    <ContentPage eyebrow="Legal" title="Return and Refund Policy" path="returns">
      <p className="text-navy/50 text-sm italic">Last updated: 29 October 2026</p>
      <p>
        We accept returns only for products that arrive expired, spoiled, damaged in transit or
        incorrect, reported to us within 24 hours of delivery with photo proof.
      </p>
      <h2>Returns we accept</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>The product is past its expiry date when delivered</li>
        <li>
          The product is spoiled on arrival, for example an off smell, mould, rancidity or
          contamination
        </li>
        <li>
          The product is damaged in transit, for example a broken jar, leakage or a broken seal
        </li>
        <li>You received a wrong product or wrong size</li>
      </ul>
      <h2>Returns we cannot accept</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Change of mind or taste preference</li>
        <li>Requests made more than 24 hours after delivery</li>
        <li>Requests without photo proof</li>
        <li>Products spoiled after delivery because of improper storage or handling</li>
        <li>Any reason not listed above under returns we accept</li>
      </ul>
      <h2>How to request a return</h2>
      <ol className="list-decimal space-y-2 pl-6">
        <li>
          Contact us within 24 hours of delivery, by WhatsApp at +91 96200 01197 or by email at
          hello@varaorganic.com.
        </li>
        <li>Share your order ID and the product name.</li>
        <li>
          Send clear photos of the product, the label showing the batch number and expiry date, and
          the outer packaging. A short video helps for spoilage or damage.
        </li>
        <li>Keep the product and its packaging until we confirm the outcome.</li>
      </ol>
      <h2>Replacement or refund</h2>
      <p>
        After verifying your photos, we will replace the product or refund the amount you paid for
        it. Online payments are refunded to the original payment method within 7 working days.
        Cash-on-delivery orders are refunded to a bank account or UPI ID you share with us.
      </p>
      <h2>Disputes and jurisdiction</h2>
      <p>
        This policy is governed by the laws of India. Any dispute arising from orders, returns or
        refunds is subject to the exclusive jurisdiction of the courts at Doddaballapur, Bengaluru
        Rural District, Karnataka.
      </p>
    </ContentPage>
  );
}
