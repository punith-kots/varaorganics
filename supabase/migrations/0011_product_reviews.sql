create table if not exists public.product_reviews (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 product_name text not null,
 author_name text not null check (char_length(author_name) between 2 and 80),
 rating integer not null check (rating between 1 and 5),
 body text not null check (char_length(body) between 10 and 2000),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(),
 moderated_at timestamptz
);
create index if not exists product_reviews_public_idx on public.product_reviews(product_id,status,created_at desc);
alter table public.product_reviews enable row level security;
-- Browser clients cannot insert, approve or read pending reviews directly.
revoke all on public.product_reviews from anon, authenticated;
grant all on public.product_reviews to service_role;
