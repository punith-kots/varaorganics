# Website checklist — 22 October 2026

Local source changes; no hosting deployment or live marketing-account verification performed.

1. Direct browser Meta and GA4 loaders/calls are removed. GTM owns browser tags. The server-side CAPI dataset ID remains needed.
2. Browser CSP now allows regional Google Analytics, Google destinations used by GA4, standard Meta graph/connect/www hosts, and Tag Manager preview resources. Google source: https://developers.google.com/tag-platform/security/guides/csp . A browser CSP cannot block Node/server-side CAPI fetches. Delivery failures there need server logs/token checks. Any custom CAPI gateway host requires its exact URL; none was provided. Hostinger-added headers and published GTM tags need live inspection.
3. Paid-order purchase dataLayer event and database browser claim are implemented. COD placement remains cod_pending and does not emit Purchase under the existing policy.
4. Server CAPI Purchase uses the same purchase_<order ID>, persisted checkout attribution and a server-only token. Live Meta Test Events deduplication remains unverified.
5. Default active in-stock 1L / honey 1kg, with availability fallback, implemented.
6. COD fee 99 with persisted breakdown, invoice, shipping and tracking handling implemented.
7. Interakt deferred at the user's explicit request; no API integration added.
8. Product review form and Admin > Reviews approval workflow implemented. New submissions remain pending; only approved reviews are returned by the public API. Rating/text limits, honeypot, per-IP process-local rate limit, server admin authentication and database RLS restrict access. No verified-buyer or aggregate rating claims were invented.
9. Category-specific badges and per-size out-of-stock labels added. Actual oil/honey packaged-product photos remain required: existing groundnut image is an ingredient photo, not the sold bottle. Do not substitute or generate false product photography. Ghee already has the supplied images.
10. view_item records the current page URL after size URL synchronization. View/add/checkout/purchase items include their size; SKU remains selected variant's SKU.

Homepage badges: Better Quality, Better Sourcing, Better Lab Tested, Better Value.

Before deployment apply outstanding migrations in order: 0009_browser_purchase_claim.sql, 0010_order_cod_fee.sql, 0011_product_reviews.sql. Existing 0007/0008 are prerequisites from the earlier release. No new environment variables for this update. Rebuild/restart on Hostinger so CSP and source changes take effect; previous ZIP files do not include this work. Live acceptance requires an approved/rejected review check, controlled paid order, GTM Preview and Meta Test Events.

Validation: 36 targeted tests passed across moderation, public review form, CSP, GTM-only browser integration, variant tracking, COD selection and purchase/CAPI behavior. Temporary preview copies under tmp are excluded from application TypeScript checks. No live review, payment, shipment or Meta event was created.
