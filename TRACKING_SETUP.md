# Vara Organic tracking handoff

The website supplies ecommerce data. Marketing owns GTM tags and publishing; no Meta tags were added inside GTM. The existing catalogue SKUs are retained. Product values and prices come from the catalogue/cart, and purchase totals come from the server-verified order.

## Deployment

1. Apply `supabase/migrations/0007_order_sms_consent.sql` if not already applied, then `0008_order_analytics.sql` in Supabase before deploying this source.
2. Set hosting variables (never commit or send the access token in chat):
   - `NEXT_PUBLIC_GTM_ID=GTM-54NPBRMX`
   - `NEXT_PUBLIC_META_PIXEL_ID=1623537109216457`
   - `NEXT_PUBLIC_SITE_URL=https://varaorganic.com`
   - `META_CAPI_TOKEN`: generated/owned by the business's Meta dataset administrator; server-only hosting secret.
   - `META_GRAPH_API_VERSION=v26.0` (default; verified against Meta's official Node SDK on 14 October 2026).
   - `META_CAPI_TEST_EVENT_CODE`: optional Events Manager Test Events code for validation. Remove after testing.
   - `NEXT_PUBLIC_USE_MOCK_DATA=false` in production. Mock mode deliberately never sends CAPI purchases.
3. Deploy and publish the marketing-owned GTM tags. Merely installing an empty GTM container does not send conversions to Meta.

## Browser contract

Every ecommerce event is preceded by `{ ecommerce: null }`. The next object contains `event` and `ecommerce: { currency: "INR", value, items }`. Each item has `item_id` (SKU), `item_name`, `item_category`, `price`, and `quantity`. Categories are ghee, honey, oil, combo.

- `view_item`: product/landing-page impression, once per displayed SKU; waits for cookie acceptance if needed.
- `add_to_cart`: each add action; value is the added quantity times its selling price.
- `begin_checkout`: once per checkout page mount, after cart hydration/consent; all cart items. Legacy carts get missing SKUs from the catalogue. Form submission does not fire another checkout event.
- `purchase`: only on `/order-confirmed/<id>` for a server-verified paid order. `transaction_id` is the internal order ID. `value` is the product subtotal, excluding shipping; shipping and tax are separate. `event_id` is `purchase_<id>` at the top level. A server-side atomic claim prevents repeat browser purchases across refreshes, reopened links and devices. localStorage remains a secondary safeguard.

All browser events remain analytics-consent gated. Existing GTM noscript fallback remains separate and runs without the JavaScript consent prompt. No historical cart actions are replayed when consent is granted later.

GTM variables: `ecommerce.value`, `ecommerce.currency`, `ecommerce.items`, `ecommerce.transaction_id`, and top-level `event_id`. Map purchase `event_id` to the Meta browser Pixel `eventID` option, not just a custom property. Browser and CAPI Purchase names and IDs must match. Disable automatic duplicate PageView/ViewContent/Purchase tags if the same events are already mapped. Only marketing can verify the published container configuration.

## Existing Pixel, COD and Klaviyo

All direct Meta Pixel and GA4 browser loaders and event calls have been removed. GTM is their only browser integration, even when the GTM environment value is blank. The Meta dataset ID remains configured solely for server-side CAPI. Account configuration has not been inspected here.

COD orders are `cod_pending`, not paid, at order time. They do not emit Purchase. A separate verified payment/collection workflow would be needed to count collected COD orders; no assumption that order placement equals payment was added.

Klaviyo checkout previously carried a value but no item list and ran on form submission. It now receives the full cart at checkout entry, with email identification remaining on valid submission. Existing server-side Resend/WhatsApp order notifications remain independent.

## Server Purchase

Checkout saves the explicit analytics consent decision and available `_fbp`, `_fbc`, browser IP and user agent. Payment webhooks use this saved browser context, never their own IP/user agent. No attribution context is stored for declined consent. Email is trimmed/lowercased and SHA-256 hashed. Indian phone numbers are normalized to digits with country code 91 before SHA-256 hashing.

After verified payment, CAPI sends the same SKUs, selling prices, subtotal and `purchase_<id>` as the browser. It records payment time and successful delivery time. A five-second request timeout or API rejection cannot fail payment finalization. No token or customer payload is logged. Repeated verified payment callbacks retry an undelivered event using the same ID/time; successful events are skipped. Concurrent callbacks may send the same ID, which Meta deduplicates.

For a failed delivery, an authenticated administrator can POST JSON `{ "orderId": "<internal UUID>" }` to `/api/admin/tracking/retry`. It refuses unpaid/non-consenting orders, skips delivered orders, and refuses events older than seven days. There is no scheduled retry worker. Monitor server `meta-capi` errors and retry promptly. Do not backfill historical orders lacking recorded consent or paid timestamps.

## SKU mapping

| Product / size | Existing SKU |
|---|---|
| Ghee 250 ml | VARA-GHEE-250 |
| Ghee 500 ml | VARA-GHEE-500 |
| Ghee 1 litre | VARA-GHEE-1000 |
| Wild forest honey 250 g | VARA-HONEY-250 |
| Wild forest honey 500 g | VARA-HONEY-500 |
| Wild forest honey 1 kg | VARA-HONEY-1000 |
| Sesame oil 500 ml | VARA-SESAME-500 |
| Sesame oil 1 litre | VARA-SESAME-1000 |
| Groundnut oil 1 litre | VARA-GNUT-1000 |
| Coconut oil 500 ml | VARA-COCO-500 |
| Multifloral honey 500 g | VARA-MHONEY-500 |
| Mane Ruchi | VARA-COMBO-1 |
| Belagge Chinna | VARA-COMBO-2 |
| Mane Adige Set | VARA-COMBO-3 |
| Mane Tumba Arogya | VARA-COMBO-4 |
| Ajji Kai Ruchi | VARA-COMBO-5 |
| Ammana Madilu | VARA-COMBO-6 |
| Namma Nadina Ruchi | VARA-COMBO-7 |
| Wellness Starter Bundle | VARA-BUNDLE-WELLNESS |

This is the checked-in catalogue mapping; live variants use their actual database SKU. No new groundnut 500 ml, coconut 1 litre or 5 litre products were invented. Meta catalogue content IDs must match these exact live SKUs.

## Acceptance still required on the live accounts

Connect Tag Assistant to the deployed site and use dataset 1623537109216457's Test Events tab. Capture one screenshot for each event with its ecommerce fields. Use a two-product cart and a combo, check shipping exclusion, refresh a paid confirmation and confirm no second purchase. Compare browser eventID and server event_id and confirm Meta deduplication. Check only one Pixel is active. Verify declined consent and COD-pending/failed orders send no purchase.

Local tests and screenshots cannot prove live GTM tag configuration, Meta delivery or attribution. Live acceptance requires the deployment, published marketing tags, server token and Meta account access. No completion date for those account-owned steps is assumed.

## Local validation completed on 14 October 2026

TypeScript passed. Forty-one targeted tests passed across ecommerce payloads, consent timing/Strict Mode, CAPI hashing and API requests, order finalization, checkout validation, and SMS consent persistence. Two initial jsdom workers timed out; those files passed on an isolated rerun.

An isolated mock-payment browser preview verified product view after accepting cookies, add-to-cart payload, checkout-on-entry, paid-order purchase, matching order-derived event ID, and refresh suppression. Evidence is saved under `tmp/tracking-*.json` and `tmp/tracking-*.png`; it is local evidence, not live Tag Assistant or Meta Test Events acceptance. No actual payment, shipment, email or Meta event was sent by that mock flow.


## Priority 1 update  -  21 October 2026

Before deploying this update, apply `supabase/migrations/0009_browser_purchase_claim.sql` in Supabase. No additional environment variables are required. Keep the existing Razorpay API key/secret, webhook secret and Meta token configured in Hostinger.

Both the signed checkout callback and signed payment webhook now fetch the payment from Razorpay and require captured status, a matching payment ID/order ID, the exact stored order total in paise, and matching currency before finalization. An authorized-only payment stays unpaid. Callback responses explain that capture is pending; webhook failures remain retryable. COD stays cod_pending. Missing production Razorpay credentials cannot create a mock payment order.

After consent on the paid confirmation page, the browser requests a one-time claim from `/api/tracking/purchase`. A single conditional database UPDATE grants only one request, including concurrent devices. Missing migration/database errors fail closed and cannot affect payment. Requests require same-origin access, a valid order UUID and explicit consent. As with the existing confirmation page, the unguessable order link acts as bearer access; this endpoint returns no customer information.

This is at-most-once browser emission, not guaranteed analytics delivery. A lost claim response, closing the tab, revoked consent or a blocked tag after the claim may lose the browser event. The claim is deliberately not released, because retrying on another device could duplicate an already delivered event. Server CAPI is independent and retains the matching purchase_<order ID>. The claim does not retroactively identify browser events emitted by the previous version, and historical orders are not backfilled.

Live acceptance still needs deployment, a controlled paid order, GTM Preview and Meta Test Events evidence showing browser/server event-ID deduplication. Verify authorized/unpaid and COD orders emit neither Purchase, and verify a confirmation opened in another browser does not produce another dataLayer Purchase. No production payment or Meta event was sent during local tests. Priority 2 consent/route/variant changes are not part of this update.

Validation: 36 targeted tests passed (payment capture, database claim, browser tracker, checkout/purchase payloads, CAPI and order finalization). TypeScript and whitespace validation are recorded separately in the delivery summary. The first combined test attempt used shared mocks and hit worker issues; the isolated run passed.

## GTM-only browser tracking update

Removed direct Meta and GA4 loaders and calls, including the no-GTM fallback. Existing dataLayer payloads and event names are unchanged. Server-side Meta CAPI and database-backed browser purchase claims remain intact. Deploy this source after migration 0009; earlier ZIP archives do not include this removal. Marketing must verify the published container emits one browser event per dataLayer event, with matching browser/server Purchase IDs. No live deployment is performed by this source update.
