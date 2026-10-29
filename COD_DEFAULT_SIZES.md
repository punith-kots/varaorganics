# Default sizes and COD fee deployment

Implemented 22 October 2026. Interakt was deferred at the user's request.

Apply migration 0009 (browser purchase claim) if still pending, and 0010_order_cod_fee.sql before uploading the new source. Keep existing environment variables. Previous archives do not include these changes.

Active in-stock 1L variants are the default for ghee and oils; honey prefers active in-stock 1kg. Otherwise use the first available active catalogue size. If all sizes are unavailable, show the preferred size with Add to Cart disabled. Bundles/combos retain their defaults. Product pages normalize their URL to the displayed size before emitting view_item, and both view_item and add_to_cart use its SKU. Listing and homepage defaults use the same rule. Hidden/inactive sizes remain hidden.

COD adds 99 rupees once per order, including orders qualifying for free delivery. Delivery fees remain separate. Online payments have no COD fee. The server calculates the fee itself and persists cod_fee; existing orders default to zero and are not repriced. shipping_amount includes delivery plus COD for tracking, so purchase value stays product subtotal and shipping carries the charges. COD placement still does not emit Purchase because payment remains cod_pending.

Checkout, confirmation, confirmation email and the new printable order invoice show a separate COD charges line. Invoice is accessible from confirmation through /order/<order UUID>/invoice and can be printed/saved to PDF. Access follows the existing unguessable order-link model; indexing is disabled. This is an order invoice with existing stored tax values, not a newly invented GST calculation.

Shiprocket receives base delivery in shipping_charges and COD fee in transaction_charges, matching its documented create-order fields. Test the actual courier collectable total after deployment. No live shipment or payment has been created in local validation.
