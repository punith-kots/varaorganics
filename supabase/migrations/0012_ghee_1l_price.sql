-- Set the requested 1L ghee price consistently for display and server checkout.
-- Preserve real inventory and active status; do not change historical order totals.
update public.product_variants
set price = 2199,
    size = '1L',
    unit_label = '1L',
    unit_base = 1000,
    unit_type = 'ml'
where sku = 'VARA-GHEE-1000';
