-- Apply before deploying the checkout SMS consent fields.
-- Existing orders remain opted out. Consent is scoped to SMS order updates.
alter table public.orders
  add column if not exists sms_opt_in boolean not null default false,
  add column if not exists sms_opt_in_at timestamptz,
  add column if not exists sms_consent_text text;

comment on column public.orders.sms_opt_in is
  'Customer explicitly opted in to SMS order confirmations and delivery updates at checkout.';
comment on column public.orders.sms_consent_text is
  'Exact consent wording accepted by the customer; not WhatsApp or marketing consent.';
