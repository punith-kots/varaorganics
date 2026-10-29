import type { Metadata } from "next";
import { ContentPage } from "@/components/ui/ContentPage";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Vara Organic collects, uses and protects your personal data.",
  path: "privacy",
});

export default function PolicyPage() {
  return (
    <ContentPage eyebrow="Legal" title="Privacy Policy" path="privacy">
      <p className="text-navy/50 text-sm italic">Last updated: 29 October 2026</p>
      <p>
        Vara Organic collects only the personal information needed to deliver your orders, support
        you and improve our website, and we never sell it.
      </p>
      <h2>Who we are</h2>
      <p>
        Vara Organic is a brand of Varixa Global Ventures Pvt. Ltd., Bengaluru (FSSAI Lic. No.
        11226998000505), operating www.varaorganic.com. This policy explains how we handle your
        personal data under the Digital Personal Data Protection Act, 2023 and other applicable
        Indian laws. You can reach us at hello@varaorganic.com or on WhatsApp at +91 96200 01197.
      </p>
      <h2>Information we collect</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] text-sm">
          <thead>
            <tr>
              <th scope="col" className="border-navy/15 border-b px-3 py-3 text-left font-semibold">
                What
              </th>
              <th scope="col" className="border-navy/15 border-b px-3 py-3 text-left font-semibold">
                Examples
              </th>
              <th scope="col" className="border-navy/15 border-b px-3 py-3 text-left font-semibold">
                When we collect it
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-navy/10 border-b px-3 py-3 align-top">Contact details</td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Name, phone number, email address
              </td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Account sign-up, checkout, enquiries
              </td>
            </tr>
            <tr>
              <td className="border-navy/10 border-b px-3 py-3 align-top">Delivery details</td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Address, city, PIN code
              </td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">Checkout</td>
            </tr>
            <tr>
              <td className="border-navy/10 border-b px-3 py-3 align-top">Order details</td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Products, amounts, payment method (COD or online), order history
              </td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                When you place an order
              </td>
            </tr>
            <tr>
              <td className="border-navy/10 border-b px-3 py-3 align-top">Payment information</td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Processed securely by our payment partner (Razorpay); we do not store card, UPI or
                bank details
              </td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">Online payments</td>
            </tr>
            <tr>
              <td className="border-navy/10 border-b px-3 py-3 align-top">Messages and uploads</td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                WhatsApp chats, emails, reviews, photos sent for returns
              </td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                When you contact us or submit a review
              </td>
            </tr>
            <tr>
              <td className="border-navy/10 border-b px-3 py-3 align-top">Device and usage data</td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                IP address, browser type, pages viewed, cookies
              </td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                When you visit the website, subject to your cookie choice
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2>How we use your information</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>To process, pack and deliver your orders, including cash-on-delivery orders</li>
        <li>To send order confirmations and delivery updates by WhatsApp, SMS or email</li>
        <li>To answer questions and handle returns and refunds</li>
        <li>To send offers and updates by WhatsApp or email, only with your consent</li>
        <li>To understand how the website is used and improve it</li>
        <li>To measure and improve our advertising</li>
        <li>
          To prevent fraud and meet legal, tax and accounting obligations, such as GST invoicing
        </li>
      </ul>
      <h2>Cookies and tracking</h2>
      <p>
        Analytics and advertising cookies load only after you click Accept on our cookie banner; if
        you click Decline, only cookies essential to running the website are used.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] text-sm">
          <thead>
            <tr>
              <th scope="col" className="border-navy/15 border-b px-3 py-3 text-left font-semibold">
                Tool
              </th>
              <th scope="col" className="border-navy/15 border-b px-3 py-3 text-left font-semibold">
                Purpose
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Google Analytics and Google Tag Manager
              </td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Understand visits, popular products and website performance
              </td>
            </tr>
            <tr>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Meta Pixel and Meta Conversions API
              </td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Measure and improve our Facebook and Instagram ads; may receive hashed email and
                phone, and order details
              </td>
            </tr>
            <tr>
              <td className="border-navy/10 border-b px-3 py-3 align-top">Microsoft Clarity</td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Understand how visitors use pages, to fix usability issues
              </td>
            </tr>
            <tr>
              <td className="border-navy/10 border-b px-3 py-3 align-top">Klaviyo</td>
              <td className="border-navy/10 border-b px-3 py-3 align-top">
                Send emails you have agreed to receive
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        You can change your choice at any time by clearing cookies in your browser and choosing
        again on the banner.
      </p>
      <h2>Who we share information with</h2>
      <p>
        We share personal data only with service providers who help us run the business, and only
        what each needs:
      </p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Courier and delivery partners, to deliver your order</li>
        <li>Payment partner (Razorpay), to process online payments</li>
        <li>Website hosting and database providers, to store orders and accounts securely</li>
        <li>
          Messaging providers (Interakt for WhatsApp, Klaviyo for email), to send order updates and
          messages
        </li>
        <li>Analytics and advertising platforms (Google, Meta, Microsoft), as described above</li>
        <li>Government or law enforcement authorities, when required by law</li>
      </ul>
      <p>
        We do not sell or rent your personal data. Some providers may process data on servers
        outside India, with safeguards required by law.
      </p>
      <h2>WhatsApp and marketing messages</h2>
      <p>
        We send order confirmations and delivery updates to the phone number you give at checkout.
        We send offers and updates only if you have agreed to receive them. To stop marketing
        messages, tap "Stop offers" or reply STOP on WhatsApp, or use the unsubscribe link in any
        email.
      </p>
      <h2>How long we keep your information</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Order and invoice records: as long as tax and accounting laws require</li>
        <li>Marketing contact details: until you withdraw consent or unsubscribe</li>
        <li>Website analytics data: up to 14 months</li>
        <li>Messages and return photos: as long as needed to resolve your request</li>
      </ul>
      <h2>How we protect your information</h2>
      <p>
        Our website uses secure HTTPS connections, access to customer data is limited to staff who
        need it, and online payments are handled by a payment partner that meets card-industry
        security standards.
      </p>
      <h2>Your rights</h2>
      <p>Under the Digital Personal Data Protection Act, 2023, you can ask us to:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Share a summary of the personal data we hold about you</li>
        <li>Correct or update your details</li>
        <li>Delete your data, except records we must keep by law</li>
        <li>Stop using your data for marketing, by withdrawing consent</li>
      </ul>
      <p>
        To make a request, email hello@varaorganic.com with the subject "Privacy request" and the
        phone number or email used for your orders. We will respond within the time required by law.
      </p>
      <h2>Children</h2>
      <p>
        Our website is meant for adults. We do not knowingly collect personal data from anyone under
        18 without a parent's or guardian's consent.
      </p>
      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The latest version will always be on this page,
        with the date of the last update at the top.
      </p>
      <h2>Grievance Officer</h2>
      <p>For any privacy concern or complaint, contact our Grievance Officer:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Name: Varshitha</li>
        <li>Email: hello@varaorganic.com</li>
        <li>WhatsApp: +91 96200 01197</li>
        <li>Address: Varixa Global Ventures Pvt. Ltd., Bengaluru, Karnataka</li>
      </ul>
    </ContentPage>
  );
}
