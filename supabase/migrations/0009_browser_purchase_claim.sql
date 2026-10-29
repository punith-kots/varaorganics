-- Atomic, server-only claim prevents browser purchases across devices.
-- This records permission to emit, not acknowledgement from GTM/Meta.
alter table public.orders
  add column if not exists browser_purchase_claimed_at timestamptz;
