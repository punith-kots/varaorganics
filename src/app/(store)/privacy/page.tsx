import type { Metadata } from "next";
import { ContentPage } from "@/components/ui/ContentPage";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Vara Organic collects, uses and protects your personal data.",
  path: "privacy",
});

export default function PrivacyPage() {
  return (
    <ContentPage eyebrow="Legal" title="Privacy Policy" path="privacy">
      <p className="text-sm italic text-navy/50">Last updated: 18 September 2026</p>
      <p>
        Varixa Global Ventures Private Limited (&ldquo;Vara Organic,&rdquo; &ldquo;we,&rdquo;
        &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website varaorganic.com (the
        &ldquo;Site&rdquo;). This Privacy Policy explains how we collect, use, disclose, and protect
        your personal information when you visit our Site or make a purchase from us. By using our
        Site, you agree to the collection and use of information in accordance with this policy.
      </p>

      <h2>1. Information we collect</h2>
      <h3>a) Information you provide to us</h3>
      <ul>
        <li>Name, email address, phone number</li>
        <li>Billing and shipping address</li>
        <li>
          Payment information (processed securely via our payment gateway partner; we do not store
          your full card details)
        </li>
        <li>Order history and preferences</li>
        <li>Any information you provide when contacting customer support</li>
      </ul>
      <h3>b) Information collected automatically</h3>
      <ul>
        <li>IP address, browser type, device information</li>
        <li>Pages visited, time spent on the Site, referring website</li>
        <li>Cookies and similar tracking technologies (see Section 6)</li>
      </ul>

      <h2>2. How we use your information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Process and fulfil your orders, including shipping and delivery</li>
        <li>Communicate with you about your order (confirmation, shipping updates, delivery status)</li>
        <li>Respond to customer service inquiries</li>
        <li>Send promotional communications, only if you have opted in (you may unsubscribe at any time)</li>
        <li>Improve our Site, products, and customer experience</li>
        <li>Detect and prevent fraud or unauthorized transactions</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. Sharing of information</h2>
      <p>We do not sell your personal information. We may share your information with:</p>
      <ul>
        <li>Logistics and courier partners (e.g., for order delivery)</li>
        <li>Payment processors (e.g., to process your payment securely)</li>
        <li>Communication service providers (e.g., for sending order updates via email or WhatsApp)</li>
        <li>Legal authorities, if required to comply with a legal obligation, court order, or government request</li>
      </ul>
      <p>
        All third parties we work with are required to handle your information securely and only for
        the purposes we specify.
      </p>

      <h2>4. Data security</h2>
      <p>
        We take reasonable technical and organizational measures to protect your personal
        information from unauthorized access, alteration, disclosure, or destruction. However, no
        method of transmission over the internet is 100% secure, and we cannot guarantee absolute
        security.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We retain your personal information for as long as necessary to fulfil the purposes outlined
        in this policy, including to comply with legal, accounting, or reporting requirements.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Our Site may use cookies and similar tracking technologies to improve your browsing
        experience, remember your preferences, and analyze site traffic. You can control or disable
        cookies through your browser settings; however, this may affect certain features of the Site.
      </p>

      <h2>7. Your rights</h2>
      <p>Depending on applicable law, you may have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your personal information</li>
        <li>Withdraw consent for marketing communications at any time</li>
      </ul>
      <p>
        To exercise any of these rights, please contact us at{" "}
        <a href="mailto:hello@varaorganic.com">hello@varaorganic.com</a>.
      </p>

      <h2>8. Children&apos;s privacy</h2>
      <p>
        Our Site is not intended for individuals under the age of 18. We do not knowingly collect
        personal information from children.
      </p>

      <h2>9. Third-party links</h2>
      <p>
        Our Site may contain links to third-party websites. We are not responsible for the privacy
        practices or content of these external sites. We encourage you to review their privacy
        policies separately.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Any changes will be posted on this page
        with a revised &ldquo;Last updated&rdquo; date. We encourage you to review this policy
        periodically.
      </p>

      <h2>11. Contact us</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy or how we handle your
        personal information, please contact us:
      </p>
      <p>
        Varixa Global Ventures Private Limited (Vara Organic)
        <br />
        Mallathahalli, Dodballapur, Bengaluru Rural, Karnataka &ndash; 561203
        <br />
        Email: <a href="mailto:hello@varaorganic.com">hello@varaorganic.com</a>
        <br />
        Website: www.varaorganic.com
      </p>
    </ContentPage>
  );
}
