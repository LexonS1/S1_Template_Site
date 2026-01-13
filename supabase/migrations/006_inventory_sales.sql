create table if not exists public.inventory_sales (
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	item_id uuid not null references public.inventory_items(id) on delete cascade,
	quantity integer not null default 1
);

alter table public.inventory_sales enable row level security;

drop policy if exists "inventory_sales_select" on public.inventory_sales;
create policy "inventory_sales_select"
on public.inventory_sales
for select
to anon, authenticated
using (true);

drop policy if exists "inventory_sales_insert" on public.inventory_sales;
create policy "inventory_sales_insert"
on public.inventory_sales
for insert
to anon, authenticated
with check (true);
