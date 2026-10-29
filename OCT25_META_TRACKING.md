# October 25 tracking update

Supersedes the earlier paid-only/COD-excluded tracking policy following the client's new instruction.

- Placed COD orders now emit purchase on /order-confirmed/{id}, after analytics consent, using the existing atomic database claim and browser deduplication.
- Online orders still require verified paid status. COD remains cod_pending, not paid.
- Server CAPI also includes placed COD using its creation time, the same purchase_<internal order UUID> event ID, and normalized hashed email/phone. Later collection does not change that event time or ID.
- Product subtotal remains value; browser shipping includes the COD fee.
- Admin CAPI retry accepts eligible COD orders, still limited to the original 7-day event window and recorded checkout consent.
- Added requested https://*.on.aws, https://*.run.app, https://*.cloud.run to connect-src. These are broad cloud domains supplied by the client; narrow to the actual gateway hosts when known.
- No direct browser Meta/GA loader or calls were added. GTM owns browser marketing tags.

No new SQL migration or environment variable is required. Existing migrations 0008/0009 and META_CAPI_TOKEN must be configured. Rebuild/redeploy these source changes; the October 22 ZIP does not include them.

## Live verification
Use a new consenting COD order and a verified online payment. In GTM Preview confirm purchase with transaction_id, product subtotal, shipping, items and event_id. Confirm the GTM Meta tag maps event_id to eventID. Refresh the confirmation page and ensure no second browser purchase. Check server logs and meta_purchase_sent_at for delivery. Use META_CAPI_TEST_EVENT_CODE for an intentional test session only, then remove it. Verify the gateway actually uses matching IDs before running it alongside direct CAPI.

An allowlisted host does not configure or activate a gateway. Browser CSP does not control the direct Node server-to-Meta request. An ad-account restriction or blocked event inside Meta cannot be diagnosed or cleared from source changes alone: obtain the exact message and screen. Do not promise a coverage percentage, warning-clear date, or ad approval.

## October 27 follow-up

The thank-you page keeps the lowercase purchase dataLayer event and ecommerce reset. An absent coupon is omitted instead of sending an empty string. Short network/HTTP 429/5xx failures in the purchase-claim request now retry after 1, 2 and 4 seconds; permanent request errors stop. Successful or already-consumed claims never retry. Retries always use the existing atomic database flag, and unmount cancels scheduled retries. Database failures emit a safe server diagnostic mentioning migration 0009.

Before notifying the client that #1 is live, upload a fresh archive containing these changes. The existing October 22 archive omits the October 25 COD fix and this follow-up. Coordinate switching off the client's temporary GTM purchase tag at deployment, then test a NEW order with consent accepted and GTM Preview open. Old orders with a consumed browser_purchase_claimed_at flag intentionally do not emit again. No additional direct fbq calls are needed: GTM handles the Meta Purchase tag.
