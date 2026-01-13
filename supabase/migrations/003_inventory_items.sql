create table if not exists public.inventory_items (
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	name text not null,
	sku text not null,
	quantity integer not null default 0,
	location text not null,
	status text not null default 'active',
	notes text
);

alter table public.inventory_items enable row level security;

drop policy if exists "inventory_items_select" on public.inventory_items;
create policy "inventory_items_select"
on public.inventory_items
for select
to anon, authenticated
using (true);

drop policy if exists "inventory_items_insert" on public.inventory_items;
create policy "inventory_items_insert"
on public.inventory_items
for insert
to anon, authenticated
with check (true);

drop policy if exists "inventory_items_update" on public.inventory_items;
create policy "inventory_items_update"
on public.inventory_items
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "inventory_items_delete" on public.inventory_items;
create policy "inventory_items_delete"
on public.inventory_items
for delete
to anon, authenticated
using (true);
