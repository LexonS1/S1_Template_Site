create table if not exists public.delivery_forecast (
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	project_name text not null,
	owner text not null,
	due_date date not null,
	status text not null default 'planned',
	risk text not null default 'low',
	notes text
);

alter table public.delivery_forecast enable row level security;

drop policy if exists "delivery_forecast_select" on public.delivery_forecast;
create policy "delivery_forecast_select"
on public.delivery_forecast
for select
to anon, authenticated
using (true);

drop policy if exists "delivery_forecast_insert" on public.delivery_forecast;
create policy "delivery_forecast_insert"
on public.delivery_forecast
for insert
to anon, authenticated
with check (true);

drop policy if exists "delivery_forecast_update" on public.delivery_forecast;
create policy "delivery_forecast_update"
on public.delivery_forecast
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "delivery_forecast_delete" on public.delivery_forecast;
create policy "delivery_forecast_delete"
on public.delivery_forecast
for delete
to anon, authenticated
using (true);
