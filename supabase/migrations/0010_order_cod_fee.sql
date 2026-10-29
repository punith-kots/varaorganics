-- Old orders retain zero fee; new COD orders record the checkout fee.
alter table public.orders add column if not exists cod_fee numeric(12,2) not null default 0
  check (cod_fee >= 0);
