-- Apply before deploying server-side Meta Purchase tracking.
alter table public.orders
  add column if not exists analytics_context jsonb,
  add column if not exists paid_at timestamptz,
  add column if not exists meta_purchase_sent_at timestamptz;

alter table public.order_items add column if not exists item_category text;

comment on column public.orders.analytics_context is
  'Consent and checkout browser attribution for paid-order CAPI. Never use payment-webhook IP or user agent.';
