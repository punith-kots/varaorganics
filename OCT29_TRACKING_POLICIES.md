# October 29 update

## GTM transaction ID

The application already pushes ecommerce.transaction_id = order.id; this is also present in the October 27 ZIP. The event_id uses the same internal UUID, which appears in /order-confirmed/{UUID}. Do not replace it with the human-readable order number, or add a second purchase push.

In GTM open Variables > DLV - transaction_id. The variable's display name can stay the same; set Data Layer Variable Name to ecommerce.transaction_id and Data Layer Version to Version 2. Map the GA4 purchase transaction_id parameter to that variable (or enable sending ecommerce data from the data layer). Publish the GTM container after preview verification.

On a NEW consenting test order, select purchase > Data Layer in Tag Assistant and inspect the actual pushed object. If ecommerce.transaction_id is present but the variable is undefined, correct GTM's mapping. If it is absent from the actual object, check the deployed source and the client's temporary GTM purchase push; that push may not contain the field. Keep exactly one purchase producer. Existing tracked orders intentionally do not emit again.

The screenshot also shows undefined content_ids/contents custom variables: those should read ecommerce.items for Meta's SKU mapping. They are GTM configuration, not another reason to send a duplicate event from website code.

## Policies

Privacy and return pages use the supplied document, dated October 29, 2026, with responsive tables and lists. The technical phrase hashed (encrypted) is corrected to hashed. This is publication of supplied content, not legal review. Interakt implementation remains deferred; external provider retention and account settings are not changed by editing the policy.

Removed conflicting no-questions/7-day/taste-refund promises from homepage, trust strip, FAQs and ad landing-page copy. Returns are limited to expired, spoiled, damaged or incorrect products, reported within 24 hours with photo proof. Approved online refunds have a 7-working-day processing period, as supplied.

For existing Supabase landing pages, run migrations/0013_return_policy_copy.sql to replace the old seeded promises without overwriting unrelated editorial changes. Source page changes need a fresh deployment. No new tracking migration is required. No ZIP was created for this request.
