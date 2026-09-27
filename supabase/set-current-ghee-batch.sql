-- Run once in the live project's Supabase SQL Editor, then redeploy/restart
-- the website to clear cached product and verification pages.
-- Source: supplied ghee jar label. No batch-specific lab results supplied.
-- Existing batches, lab results and orders remain as historical records.
begin;

do $$
declare
  ghee_product_id uuid;
  target_batch public.product_batches%rowtype;
begin
  select id into strict ghee_product_id
  from public.products
  where slug = 'a2-gir-cow-bilona-ghee'
  for update;

  insert into public.product_batches
    (product_id, batch_number, mfg_date, best_before, lab_report_url, active)
  values
    (ghee_product_id, 'G012092026', date '2026-09-12', date '2027-09-11', null, false)
  on conflict (batch_number) do nothing;

  select * into strict target_batch
  from public.product_batches
  where batch_number = 'G012092026'
  for update;

  if target_batch.product_id <> ghee_product_id
     or target_batch.mfg_date <> date '2026-09-12'
     or target_batch.best_before <> date '2027-09-11' then
    raise exception 'G012092026 already exists with different product or dates; no changes applied';
  end if;

  update public.product_batches
  set active = false
  where product_id = ghee_product_id and id <> target_batch.id and active;

  update public.product_batches set active = true where id = target_batch.id;
end $$;

commit;

select batch_number, mfg_date, best_before, active
from public.product_batches
where product_id = (select id from public.products where slug = 'a2-gir-cow-bilona-ghee')
order by active desc, created_at desc;
