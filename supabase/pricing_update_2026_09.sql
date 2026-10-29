-- Vara Organic — pricing refresh + new products (Sep 2026 brief).
-- Run in the Supabase SQL editor. Idempotent (safe to re-run).
--
-- Source: Vara_Organic_Pricing_Upload_Sheet.xlsx + Website Update Brief.
-- All prices are final MRP (tax-inclusive). compare_at_price is cleared where a
-- previously seeded "was" price would now imply a fabricated discount.

begin;

-- ─────────────────────────────────────────────────────────────
-- 1. Price updates + activations for existing variants
-- ─────────────────────────────────────────────────────────────
-- A2 Gir Cow Bilona Ghee (Premium)
update public.product_variants set price = 599,  active = true            where sku = 'VARA-GHEE-250';
update public.product_variants set price = 1199                            where sku = 'VARA-GHEE-500';
update public.product_variants set price = 2199, compare_at_price = null   where sku = 'VARA-GHEE-1000';

-- Raw Wild Forest Honey
update public.product_variants set price = 349                             where sku = 'VARA-HONEY-250';
update public.product_variants set price = 649                             where sku = 'VARA-HONEY-500';
update public.product_variants set price = 1199, active = true             where sku = 'VARA-HONEY-1000';

-- Wood Pressed Sesame Oil
update public.product_variants set price = 549,  active = true            where sku = 'VARA-SESAME-500';
update public.product_variants set price = 899                            where sku = 'VARA-SESAME-1000';

-- Wood Pressed Groundnut Oil
update public.product_variants set price = 550,  position = 1            where sku = 'VARA-GNUT-1000';

-- ─────────────────────────────────────────────────────────────
-- 2. New size variants for existing oils (brief item 4 + pricing sheet)
-- ─────────────────────────────────────────────────────────────
insert into public.product_variants
  (product_id, size, sku, price, compare_at_price, stock, unit_label, unit_base, unit_type, route_slug, active, position)
select p.id, v.size, v.sku, v.price, null, v.stock, v.unit_label, v.unit_base, 'ml', v.route_slug, true, v.position
from public.products p
join (values
  ('wood-pressed-groundnut-oil','500ml','VARA-GNUT-500', 310, 40, '500ml', 500, null,                              0),
  ('wood-pressed-groundnut-oil','5L',   'VARA-GNUT-5000',3499,15, '5L',    5000,null,                              2),
  ('wood-pressed-sesame-oil',   '5L',   'VARA-SESAME-5000',3999,15,'5L',   5000,null,                              2)
) as v(pslug, size, sku, price, stock, unit_label, unit_base, route_slug, position)
  on p.slug = v.pslug
on conflict (sku) do update set price = excluded.price, active = true;

-- ─────────────────────────────────────────────────────────────
-- 3. NEW PRODUCT — Desi Cow Ghee (Value line)
--    NOTE: placeholder copy + no lab batch yet. Review/enrich in Admin and add
--    a real lab report before relying on any test claim.
-- ─────────────────────────────────────────────────────────────
insert into public.products (slug, product_name, category, route_prefix, short_description, long_description, ingredients, active, featured, is_bundle)
values (
  'desi-cow-ghee', 'Desi Cow Ghee', 'ghee', 'ghee',
  'Wholesome desi cow ghee for everyday cooking — our value line alongside the premium A2 Gir Bilona ghee.',
  $md$## Desi Cow Ghee

Traditionally prepared desi cow ghee for daily Indian cooking — aromatic, golden, and kitchen-ready. Our value line, priced for everyday use.$md$,
  '100% desi cow ghee. Nothing added.',
  true, false, false
) on conflict (slug) do update set product_name = excluded.product_name, category = excluded.category, route_prefix = excluded.route_prefix, active = excluded.active;

insert into public.product_variants
  (product_id, size, sku, price, compare_at_price, stock, unit_label, unit_base, unit_type, route_slug, active, position)
select p.id, v.size, v.sku, v.price, null, v.stock, v.unit_label, v.unit_base, 'ml', v.route_slug, true, v.position
from public.products p
join (values
  ('desi-cow-ghee','250ml','VARA-DESI-250', 399, 30, '250ml', 250, null,                        0),
  ('desi-cow-ghee','500ml','VARA-DESI-500', 799, 30, '500ml', 500, 'desi-cow-ghee-500ml',       1),
  ('desi-cow-ghee','1L',   'VARA-DESI-1000',1599,20, '1L',    1000,'desi-cow-ghee-1l',           2)
) as v(pslug, size, sku, price, stock, unit_label, unit_base, route_slug, position)
  on p.slug = v.pslug
on conflict (sku) do update set price = excluded.price, active = true;

-- ─────────────────────────────────────────────────────────────
-- 4. NEW PRODUCT — Wood Pressed Coconut Oil
--    NOTE: placeholder copy + no lab batch yet. Review/enrich in Admin.
-- ─────────────────────────────────────────────────────────────
insert into public.products (slug, product_name, category, route_prefix, short_description, long_description, ingredients, active, featured, is_bundle)
values (
  'wood-pressed-coconut-oil', 'Wood Pressed Coconut Oil', 'oils', 'oils',
  'Wood-pressed (ghani) coconut oil — unrefined, with its natural aroma intact. For cooking, skin and hair.',
  $md$## Wood Pressed Coconut Oil

Extracted on a traditional wooden ghani, unrefined and cold-processed — the coconut aroma and character kept intact.$md$,
  '100% wood-pressed (ghani) coconut oil. Unrefined. No additives.',
  true, false, false
) on conflict (slug) do update set product_name = excluded.product_name, active = excluded.active;

insert into public.product_variants
  (product_id, size, sku, price, compare_at_price, stock, unit_label, unit_base, unit_type, route_slug, active, position)
select p.id, v.size, v.sku, v.price, null, v.stock, v.unit_label, v.unit_base, 'ml', v.route_slug, true, v.position
from public.products p
join (values
  ('wood-pressed-coconut-oil','500ml','VARA-WCOCO-500', 649, 30, '500ml', 500, 'wood-pressed-coconut-oil-500ml', 0),
  ('wood-pressed-coconut-oil','1L',   'VARA-WCOCO-1000',1099,20, '1L',    1000,'wood-pressed-coconut-oil-1l',    1)
) as v(pslug, size, sku, price, stock, unit_label, unit_base, route_slug, position)
  on p.slug = v.pslug
on conflict (sku) do update set price = excluded.price, active = true;

-- Placeholder images for the two new products (coloured cards until real photos).
insert into public.product_images (product_id, url, alt, position)
select p.id, img.url, p.product_name || ' - product photo', 0
from public.products p
join (values
  ('desi-cow-ghee','/placeholders/ghee.svg'),
  ('wood-pressed-coconut-oil','/placeholders/coconut.svg')
) as img(pslug, url) on p.slug = img.pslug
where not exists (select 1 from public.product_images pi where pi.product_id = p.id);

commit;

-- Review after running:
--   select pr.product_name, v.sku, v.size, v.price, v.active
--   from public.product_variants v join public.products pr on pr.id = v.product_id
--   order by pr.product_name, v.position;
